const express = require('express');
const { firefox } = require('playwright');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

// playwright-mcp 工具
const playwrightMCP = require('playwright-mcp');

// 使用 playwright-mcp 提取特定值的辅助函数
async function extractValueByMCP(snapshot, keyword, valueType) {
    try {
        // 在快照中查找包含关键词和值类型的元素
        const elements = snapshot.children || [];
        
        // 遍历元素查找匹配项
        for (const element of elements) {
            const text = element.textContent || '';
            
            // 检查元素文本是否包含关键词
            if (text.includes(keyword)) {
                // 使用正则表达式提取数字
                const numberPattern = /\d{1,3}(?:[,，]\d{3})*(?:\.\d+)?|\b\d{1,3}(?:\.\d+)?\b/g;
                const matches = text.match(numberPattern);
                
                if (matches && matches.length > 0) {
                    // 根据值类型选择合适的数值
                    if (valueType === '资讯') {
                        // 对于资讯指数，选择最大的数值
                        let maxValue = 0;
                        let maxValueStr = '';
                        for (const match of matches) {
                            const numValue = parseFloat(match.replace(/[,，]/g, ''));
                            if (numValue > maxValue) {
                                maxValue = numValue;
                                maxValueStr = match;
                            }
                        }
                        return maxValueStr;
                    } else if (valueType === '整体') {
                        // 对于整体值，选择第一个数值
                        return matches[0];
                    } else if (valueType === '移动') {
                        // 对于移动值，选择第二个数值
                        return matches.length > 1 ? matches[1] : matches[0];
                    }
                }
            }
            
            // 递归检查子元素
            if (element.children && element.children.length > 0) {
                const result = await extractValueByMCP({ children: element.children }, keyword, valueType);
                if (result !== '无法获取') {
                    return result;
                }
            }
        }
        
        return '无法获取';
    } catch (error) {
        console.error(`使用 playwright-mcp 提取 ${valueType} 值时出错:`, error);
        return '无法获取';
    }
}

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// 存储浏览器实例和页面，以便保持登录状态
let browser = null;
let page = null;
let isLoggedIn = false;

// 创建数据目录
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// 主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 初始化浏览器
app.post('/init', async (req, res) => {
    try {
        if (!browser) {
            browser = await firefox.launch({ headless: false });
        }
        res.json({ success: true, message: '浏览器初始化成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 登录百度指数
app.post('/login', async (req, res) => {
    try {
        if (!browser) {
            return res.status(400).json({ success: false, message: '请先初始化浏览器' });
        }

        page = await browser.newPage();
        await page.goto('https://index.baidu.com/v2/index.html#/');
        
        // 等待用户手动登录
        res.json({ success: true, message: '请在浏览器中手动登录百度指数，登录完成后点击"确认登录"按钮' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 确认登录状态
app.post('/confirm-login', async (req, res) => {
    try {
        if (!page) {
            return res.status(400).json({ success: false, message: '请先打开百度指数页面' });
        }

        // 检查是否已经登录
        // 尝试多种可能的选择器来检测登录状态
        const userSelectors = [
            '.user-name',
            '.username',
            '.user-info',
            '.login-info',
            '[class*="user"][class*="name"]',
            '[class*="username"]'
        ];
        
        let isLoginSuccess = false;
        
        for (const selector of userSelectors) {
            try {
                const userElement = await page.$(selector);
                if (userElement) {
                    const text = await userElement.innerText();
                    if (text && text.trim() !== '') {
                        isLoginSuccess = true;
                        break;
                    }
                }
            } catch (e) {
                // 继续尝试下一个选择器
                continue;
            }
        }
        
        // 如果通过选择器没检测到，尝试检查页面URL
        if (!isLoginSuccess) {
            const currentUrl = page.url();
            // 如果不在登录页，可能已经登录
            if (!currentUrl.includes('login') && !currentUrl.includes('passport')) {
                isLoginSuccess = true;
            }
        }
        
        if (isLoginSuccess) {
            isLoggedIn = true;
            res.json({ success: true, message: '登录成功' });
        } else {
            res.json({ success: false, message: '尚未登录，请先登录' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 搜索关键词并获取日平均值
app.post('/search', async (req, res) => {
    try {
        if (!page || !isLoggedIn) {
            return res.status(400).json({ success: false, message: '请先登录' });
        }

        const { keywords } = req.body;
        if (!keywords || !Array.isArray(keywords)) {
            return res.status(400).json({ success: false, message: '请提供关键词数组' });
        }

        const results = [];

        for (const keyword of keywords) {
            try {
                // 访问百度指数页面
                await page.goto('https://index.baidu.com/v2/index.html#/');
                
                // 输入关键词
                // 尝试多种可能的输入框选择器
                const inputSelectors = [
                    '#schword',
                    '.search-input',
                    '[placeholder*="请输入"]',
                    'input[type="text"]'
                ];
                
                let inputFound = false;
                for (const selector of inputSelectors) {
                    try {
                        const inputElement = await page.$(selector);
                        if (inputElement) {
                            await inputElement.fill(keyword);
                            inputFound = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!inputFound) {
                    throw new Error('无法找到搜索输入框');
                }
                
                // 尝试多种可能的搜索按钮选择器
                const buttonSelectors = [
                    '.search-input-operate .button',
                    '.search-btn',
                    '.search-button',
                    '[class*="search"][type="button"]',
                    'button[type="submit"]'
                ];
                
                let buttonFound = false;
                for (const selector of buttonSelectors) {
                    try {
                        const buttonElement = await page.$(selector);
                        if (buttonElement) {
                            await buttonElement.click();
                            buttonFound = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!buttonFound) {
                    // 如果找不到按钮，尝试按回车
                    await page.press('body', 'Enter');
                }
                
                // 等待结果加载
                // 使用多种可能的选择器等待页面加载
                const waitSelectors = [
                    '.index-main-indexInfo',
                    '.view-value-content',
                    '.index-detail',
                    '.trend-box',
                    '[class*="index"]'
                ];
                
                let pageLoaded = false;
                for (const selector of waitSelectors) {
                    try {
                        await page.waitForSelector(selector, { timeout: 5000 });
                        pageLoaded = true;
                        break;
                    } catch (e) {
                        // 继续尝试下一个选择器
                        continue;
                    }
                }
                
                // 如果所有选择器都失败了，至少等待一段时间让页面加载
                if (!pageLoaded) {
                    await page.waitForTimeout(3000);
                }
                
                // 获取日平均值
                // 百度指数的整体趋势数据
                let avgValue = '无法获取';
                
                try {
                    // 使用 playwright-mcp 提取数据
                    let overallAvg = '无法获取';
                    let mobileAvg = '无法获取';
                    let newsAvg = '无法获取';
                    
                    // 由于 playwright-mcp 函数调用存在问题，直接使用备用方案提高运行速度
                    console.log('跳过 playwright-mcp，直接使用备用方案提取数据');
                    
                    // 如果 playwright-mcp 提取失败，使用备用方案
                    if (overallAvg === '无法获取' || mobileAvg === '无法获取' || newsAvg === '无法获取') {
                        // 获取所有 .veui-table-column-right 元素的文本
                        const valueElements = await page.$$('.veui-table-column-right');
                        const allValues = [];
                        for (const element of valueElements) {
                            try {
                                const text = await element.innerText();
                                // 支持小数、不同位数的数字
                                const numberPattern = /\d{1,3}(?:[,，]\d{3})*(?:\.\d+)?|\b\d{1,3}(?:\.\d+)?\b/g;
                                const matches = text.match(numberPattern);
                                
                                if (matches && matches.length > 0) {
                                    allValues.push(...matches);
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                        
                        // 备用方案中输出所有提取的值
                        console.log('备用方案提取的所有数值:', allValues);
                        
                        // 根据百度指数的特点，我们需要前两个数值和资讯指数值
                        if (allValues.length >= 3) {
                            overallAvg = allValues[0] || overallAvg;
                            mobileAvg = allValues[1] || mobileAvg;
                            // 资讯指数值是倒数第三个数值
                            if (allValues.length >= 3) {
                                newsAvg = allValues[allValues.length - 3] || newsAvg;
                            } else if (allValues.length >= 2) {
                                newsAvg = allValues[allValues.length - 2] || newsAvg;
                            } else {
                                newsAvg = allValues[allValues.length - 1] || newsAvg;
                            }
                        }
                    }
                    
                    // 组合三个值
                    avgValue = `${overallAvg} ${mobileAvg} ${newsAvg}`;
                } catch (e) {
                    console.error('使用 playwright-mcp 获取日平均值时出错:', e);
                    
                    // 回退到原始方法
                    try {
                        // 根据调试结果，精确提取百度指数的三个值
                        let overallAvg = '无法获取';  // 整体日平均值
                        let mobileAvg = '无法获取';   // 移动日均值
                        let newsAvg = '无法获取';     // 资讯指数日均值
                        
                        // 查找所有 .veui-table-column-right 元素
                        const valueElements = await page.$$('.veui-table-column-right');
                        
                        // 首先尝试使用精确的CSS选择器获取资讯指数值
                        try {
                            const newsElements = await page.$$('div.index-trend-view div.index-trend-content div.content-wrapper table.veui-table tbody tr td.veui-table-column-right div.veui-table-cell');
                            if (newsElements && newsElements.length > 0) {
                                // 获取最后一个元素，通常是资讯指数值
                                const newsElement = newsElements[newsElements.length - 1];
                                const newsText = await newsElement.innerText();
                                // 支持小数、不同位数的数字
                                const numberPattern = /\d{1,3}(?:[,，]\d{3})*(?:\.\d+)?|\b\d{1,3}(?:\.\d+)?\b/g;
                                const matches = newsText.match(numberPattern);
                                if (matches && matches.length > 0) {
                                    newsAvg = matches[0];
                                }
                            }
                        } catch (e) {
                            console.log('无法通过精确CSS选择器获取资讯指数值:', e);
                        }
                        
                        // 根据父元素文本内容识别各个值
                        for (const element of valueElements) {
                            try {
                                const elementText = await element.innerText();
                                const parentText = await element.evaluate(el => el.parentElement ? el.parentElement.innerText : '');
                                
                                // 使用正则表达式提取数字
                                // 支持小数、不同位数的数字
                                const numberPattern = /\d{1,3}(?:[,，]\d{3})*(?:\.\d+)?|\b\d{1,3}(?:\.\d+)?\b/g;
                                const matches = elementText.match(numberPattern);
                                
                                if (matches && matches.length > 0) {
                                    const value = matches[0];
                                    
                                    // 根据父元素文本内容判断数值类型
                                    if (parentText.includes(keyword) && newsAvg === '无法获取') {
                                        // 放宽判断条件，优先匹配包含"资讯"的项
                                        if (parentText.includes('资讯')) {
                                            if (!parentText.includes('%') || newsAvg === '无法获取') {
                                                newsAvg = value;
                                                console.log('提取到资讯指数值:', value, '父元素文本:', parentText);
                                            }
                                        } else if (!parentText.includes('资讯')) {
                                            // 前两个值 - 父元素包含关键词但不包含"资讯"
                                            if (overallAvg === '无法获取') {
                                                overallAvg = value;
                                                console.log('提取到整体日平均值:', value, '父元素文本:', parentText);
                                            } else if (mobileAvg === '无法获取' && overallAvg !== '无法获取') {
                                                mobileAvg = value;
                                                console.log('提取到移动日均值:', value, '父元素文本:', parentText);
                                            }
                                        }
                                    }
                                }
                            } catch (e) {
                                // 继续处理下一个元素
                                continue;
                            }
                        }
                        
                        // 如果通过精确匹配失败，则尝试备用方法
                        if (overallAvg === '无法获取' || mobileAvg === '无法获取' || newsAvg === '无法获取') {
                            console.log('使用备用方案提取数值');
                            // 获取所有 .veui-table-column-right 元素的文本
                            const allValues = [];
                            for (const element of valueElements) {
                                try {
                                    const text = await element.innerText();
                                    // 支持小数、不同位数的数字
                                    const numberPattern = /\d{1,3}(?:[,，]\d{3})*(?:\.\d+)?|\b\d{1,3}(?:\.\d+)?\b/g;
                                    const matches = text.match(numberPattern);
                                    
                                    if (matches && matches.length > 0) {
                                        allValues.push(...matches);
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                            
                            // 备用方案中输出所有提取的值
                            console.log('备用方案提取的所有数值:', allValues);
                            
                            // 根据百度指数的特点，我们需要前两个数值和资讯指数值
                            if (allValues.length >= 3) {
                                overallAvg = allValues[0] || overallAvg;
                                mobileAvg = allValues[1] || mobileAvg;
                                
                                // 资讯指数值是倒数第三个值
                                // 根据您的示例数据排列：
                                // '24,238', '17,205',
                                // '14', '60',
                                // '29', '68',
                                // '8,819,510', '58',
                                // '28'
                                // 资讯指数值应该是 '8,819,510'，即倒数第三个值
                                if (allValues.length >= 3) {
                                    newsAvg = allValues[allValues.length - 3] || newsAvg;
                                } else if (allValues.length >= 2) {
                                    newsAvg = allValues[allValues.length - 2] || newsAvg;
                                } else {
                                    newsAvg = allValues[allValues.length - 1] || newsAvg;
                                }
                            }
                        }
                        
                        // 组合三个值
                        avgValue = `${overallAvg} ${mobileAvg} ${newsAvg}`;
                    } catch (fallbackError) {
                        console.error('回退方法也失败了:', fallbackError);
                        avgValue = `错误: ${fallbackError.message}`;
                    }
                }
                
                results.push({
                    keyword,
                    avgValue,
                    timestamp: new Date().toISOString()
                });
                
                // 添加延迟避免请求过快
                await page.waitForTimeout(2000);
            } catch (keywordError) {
                results.push({
                    keyword,
                    avgValue: `错误: ${keywordError.message}`,
                    timestamp: new Date().toISOString()
                });
            }
        }

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 导出数据为 CSV
app.post('/export', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ success: false, message: '没有数据可导出' });
        }

        // 解析数据以适应新的CSV格式
        const processedData = data.map(item => {
            let value1 = '';
            let value2 = '';
            let value3 = '';
            
            if (item.avgValue && item.avgValue !== '无法获取') {
                const values = item.avgValue.split(' ');
                value1 = values[0] || '';
                value2 = values[1] || '';
                value3 = values[2] || '';
            }
            
            return {
                keyword: item.keyword,
                overallAvg: value1,
                mobileAvg: value2,
                newsAvg: value3,
                timestamp: item.timestamp
            };
        });
        
        const csvWriter = createObjectCsvWriter({
            path: path.join(dataDir, 'baidu_index_data.csv'),
            header: [
                { id: 'keyword', title: '关键词' },
                { id: 'overallAvg', title: '整体日平均值' },
                { id: 'mobileAvg', title: '移动日均值' },
                { id: 'newsAvg', title: '资讯指数日均值' },
                { id: 'timestamp', title: '时间戳' }
            ]
        });

        await csvWriter.writeRecords(processedData);
        
        res.json({ 
            success: true, 
            message: '数据导出成功',
            filePath: path.join(dataDir, 'baidu_index_data.csv')
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 调试页面元素
app.post('/debug-elements', async (req, res) => {
    try {
        if (!page) {
            return res.status(400).json({ success: false, message: '请先初始化浏览器并打开页面' });
        }

        // 获取页面上所有包含数字的元素
        const elementsData = await page.evaluate(() => {
            // 支持小数、不同位数的数字
            const numberPattern = /\d{1,3}(?:[,，]\d{3})*(?:\.\d+)?|\b\d{1,3}(?:\.\d+)?\b/g;
            const elements = [];
            
            // 查找所有可能包含数值的元素
            const valueElements = Array.from(document.querySelectorAll('*'))
                .filter(el => {
                    const text = el.innerText;
                    return text && numberPattern.test(text);
                });
            
            // 为每个元素生成唯一选择器和相关信息
            valueElements.forEach((el, index) => {
                const text = el.innerText;
                const matches = text.match(numberPattern);
                
                if (matches && matches.length > 0) {
                    // 生成CSS选择器
                    let selector = '';
                    if (el.id) {
                        selector = `#${el.id}`;
                    } else if (el.className && typeof el.className === 'string') {
                        selector = `.${el.className.split(' ').join('.')}`;
                    } else {
                        // 生成基于标签和位置的选择器
                        const tag = el.tagName.toLowerCase();
                        const parent = el.parentElement;
                        if (parent) {
                            const siblings = Array.from(parent.children);
                            const elIndex = siblings.indexOf(el);
                            selector = `${tag}:nth-child(${elIndex + 1})`;
                        } else {
                            selector = tag;
                        }
                    }
                    
                    // 获取父元素文本以帮助识别元素用途
                    const parentText = el.parentElement ? el.parentElement.innerText.substring(0, 100) : '';
                    
                    elements.push({
                        selector: selector,
                        text: text.trim(),
                        numbers: matches,
                        parentText: parentText.trim()
                    });
                }
            });
            
            return elements;
        });
        
        res.json({ success: true, data: elementsData });
    } catch (error) {
        console.error('调试页面元素时出错:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 关闭浏览器
app.post('/close', async (req, res) => {
    try {
        if (browser) {
            await browser.close();
            browser = null;
            page = null;
            isLoggedIn = false;
            res.json({ success: true, message: '浏览器已关闭' });
        } else {
            res.json({ success: true, message: '浏览器未启动' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});