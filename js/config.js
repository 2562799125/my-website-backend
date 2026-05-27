// 配置文件 - 请在此处设置您的高德地图API密钥
const CONFIG = {
    // 高德地图API配置
    AMAP: {
        // 高德地图API密钥（向后兼容）
        // 获取API密钥: https://console.amap.com/dev/key/app
        API_KEY: 'e10f467ce63edfc64ad3a6ecc1e6820d',
        // 新增：区分WebJS与Web服务密钥
        WEB_JS_KEY: 'e10f467ce63edfc64ad3a6ecc1e6820d',
        SERVICE_KEY: 'b8484ed101c2ea3dd66467e0e0118d99',
        BASE_URL: 'https://restapi.amap.com/v3',
        WEB_API_URL: 'https://webapi.amap.com/maps?v=2.0',
        
        // API服务配置
        SERVICES: {
            ELEVATION: true,        // 启用高程数据服务
            STATIC_MAPS: true,     // 启用静态地图服务
            GEOCODING: true        // 启用地理编码服务
        },
        
        // 默认地图配置
        DEFAULT_LOCATION: {
            lat: 29.5833,          // 重庆重钢歌乐山矿坐标
            lng: 106.4833
        },
        
        // 地形数据配置
        TERRAIN: {
            RESOLUTION: 20,        // 高程数据采样分辨率 (20x20网格)
            MAX_ZOOM: 18,         // 最大缩放级别
            TILE_SIZE: 512        // 瓦片大小
        }
    },
    
    // 矿山数据配置
    MINES: {
        // 默认矿山位置 - 重庆重钢歌乐山矿
        DEFAULT: {
            name: '重庆重钢歌乐山矿',
            lat: 29.5833,
            lng: 106.4833,
            type: '地下矿'
        },
        
        // 矿山列表
        LIST: [
            {
                id: 'mine_003',
                name: '内蒙古准格尔煤矿',
                lat: 39.8612,
                lng: 111.1851,
                type: '露天矿',
                status: 'active',
                description: '内蒙古鄂尔多斯市准格尔旗大型露天煤矿'
            },
            {
                id: 'mine_004',
                name: '内蒙古黑岱沟露天煤矿',
                lat: 39.7234,
                lng: 111.9876,
                type: '露天矿',
                status: 'active',
                description: '内蒙古准格尔旗黑岱沟露天煤矿，亚洲最大露天煤矿之一'
            },
            {
                id: 'mine_006',
                name: '重庆重钢歌乐山矿',
                lat: 29.5833,
                lng: 106.4833,
                type: '地下矿',
                status: 'active',
                description: '重庆市沙坪坝区重钢歌乐山矿，位于歌乐山风景区附近'
            }
        ]
    },
    
    // 地图渲染配置
    RENDERING: {
        PERFORMANCE_MODE: 'auto', // 性能模式: 'high', 'medium', 'low', 'auto'
        TEXTURE_QUALITY: 'high'   // 纹理质量: 'high', 'medium', 'low'
    },
    
    // 调试配置
    DEBUG: {
        ENABLE_CONSOLE_LOGS: true,
        SHOW_WIREFRAME: false,
        SHOW_COORDINATES: false,
        ENABLE_STATS: false
    }
};

// 导出配置对象
window.CONFIG = CONFIG;

// 高德地图API密钥管理
let amapApiKey = null;
let amapWebJsKey = null; // Web JS密钥
let amapServiceKey = null; // Web服务密钥

// 获取WebJS密钥
function getAmapWebJsKey() {
    if (amapWebJsKey) return amapWebJsKey;
    const stored = localStorage.getItem('amap_webjs_key');
    if (stored && stored !== 'YOUR_AMAP_KEY_HERE') {
        amapWebJsKey = stored;
        return amapWebJsKey;
    }
    if (CONFIG.AMAP.WEB_JS_KEY && CONFIG.AMAP.WEB_JS_KEY !== 'YOUR_AMAP_KEY_HERE') {
        amapWebJsKey = CONFIG.AMAP.WEB_JS_KEY;
        return amapWebJsKey;
    }
    // 最后回退到通用API_KEY
    return getAmapApiKey();
}

// 获取Web服务密钥（REST/静态地图）
function getAmapServiceKey() {
    if (amapServiceKey) return amapServiceKey;
    const stored = localStorage.getItem('amap_service_key');
    if (stored && stored !== 'YOUR_AMAP_KEY_HERE') {
        amapServiceKey = stored;
        return amapServiceKey;
    }
    if (CONFIG.AMAP.SERVICE_KEY && CONFIG.AMAP.SERVICE_KEY !== 'YOUR_AMAP_KEY_HERE') {
        amapServiceKey = CONFIG.AMAP.SERVICE_KEY;
        return amapServiceKey;
    }
    // 最后回退到通用API_KEY
    return getAmapApiKey();
}

// 设置WebJS密钥
function setAmapWebJsKey(key) {
    if (!key || typeof key !== 'string') throw new Error('WebJS密钥必须是有效的字符串');
    amapWebJsKey = key;
    localStorage.setItem('amap_webjs_key', key);
    console.log('✅ WebJS密钥已保存');
}

// 设置Web服务密钥
function setAmapServiceKey(key) {
    if (!key || typeof key !== 'string') throw new Error('Web服务密钥必须是有效的字符串');
    amapServiceKey = key;
    localStorage.setItem('amap_service_key', key);
    console.log('✅ Web服务密钥已保存');
}

/**
 * 获取高德地图API密钥
 */
function getAmapApiKey() {
    // 优先从内存获取
    if (amapApiKey) {
        return amapApiKey;
    }
    
    // 从localStorage获取
    const storedKey = localStorage.getItem('amap_api_key');
    if (storedKey && storedKey !== 'YOUR_AMAP_KEY_HERE') {
        amapApiKey = storedKey;
        return amapApiKey;
    }
    
    // 从配置文件获取
    if (CONFIG.AMAP.API_KEY && CONFIG.AMAP.API_KEY !== 'YOUR_AMAP_KEY_HERE') {
        amapApiKey = CONFIG.AMAP.API_KEY;
        return amapApiKey;
    }
    
    return null;
}

/**
 * 设置高德地图API密钥
 */
function setAmapApiKey(key) {
    if (!key || typeof key !== 'string') {
        throw new Error('API密钥必须是有效的字符串');
    }
    
    amapApiKey = key;
    localStorage.setItem('amap_api_key', key);
    console.log('✅ 高德地图API密钥已保存');
}

/**
 * 验证API密钥格式
 */
function validateAmapApiKey(key = null) {
    const apiKey = key || getAmapApiKey();
    
    if (!apiKey) {
        return { valid: false, message: 'API密钥未配置' };
    }
    
    if (apiKey === 'YOUR_AMAP_KEY_HERE') {
        return { valid: false, message: 'API密钥为默认值，请配置真实密钥' };
    }
    
    // 高德API密钥通常是32位字符串
    if (apiKey.length < 20) {
        return { valid: false, message: 'API密钥格式不正确' };
    }
    
    return { valid: true, message: 'API密钥格式正确' };
}

/**
 * 检查服务是否启用
 */
function isServiceEnabled(serviceName) {
    return CONFIG.AMAP.SERVICES[serviceName] === true;
}

/**
 * 获取矿山数据
 */
function getMineData(mineId = null) {
    if (mineId) {
        return CONFIG.MINES.LIST.find(mine => mine.id === mineId) || CONFIG.MINES.DEFAULT;
    }
    return CONFIG.MINES.LIST;
}

/**
 * 获取默认矿山
 */
function getDefaultMine() {
    return CONFIG.MINES.DEFAULT;
}

/**
 * 初始化高德地图集成
 */
async function initializeAmapIntegration() {
    try {
        console.log('🚀 开始初始化高德地图集成...');
        
        // 检查API密钥
        const validation = validateAmapApiKey();
        if (!validation.valid) {
            throw new Error(`API密钥验证失败: ${validation.message}`);
        }
        
        // 检查集成模块是否加载
        if (typeof window.amapIntegration === 'undefined') {
            throw new Error('高德地图集成模块未加载');
        }
        
        // 初始化集成
        await window.amapIntegration.initialize();
        
        console.log('✅ 高德地图集成初始化成功');
        return true;
        
    } catch (error) {
        console.error('❌ 高德地图集成初始化失败:', error);
        return false;
    }
}



// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📋 开始加载矿山可视化监管平台...');
    
    try {
        // 等待其他模块加载
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 尝试初始化高德地图
        const amapSuccess = await initializeAmapIntegration();
        
        if (amapSuccess) {
            console.log('✅ 使用高德地图服务');
        } else {
            console.log('⚠️ 高德地图不可用，使用默认配置');
        }
        
        console.log('🎉 平台初始化完成');
        
    } catch (error) {
        console.error('❌ 平台初始化失败:', error);
        
        // 创建默认地形作为后备
        setTimeout(() => {
            createDefaultTerrain();
        }, 1000);
    }
});

// 导出函数到全局作用域
window.getAmapApiKey = getAmapApiKey;
window.setAmapApiKey = setAmapApiKey;
window.validateAmapApiKey = validateAmapApiKey;
window.getAmapWebJsKey = getAmapWebJsKey;
window.getAmapServiceKey = getAmapServiceKey;
window.setAmapWebJsKey = setAmapWebJsKey;
window.setAmapServiceKey = setAmapServiceKey;
window.isServiceEnabled = isServiceEnabled;
window.getMineData = getMineData;
window.getDefaultMine = getDefaultMine;
window.initializeAmapIntegration = initializeAmapIntegration;


console.log('⚙️ 配置文件已加载 - 高德地图版本');