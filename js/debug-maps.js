/**
 * 高德地图调试工具
 * 用于诊断地图加载问题
 */

class MapsDebugger {
    constructor() {
        this.debugInfo = {
            configLoaded: false,
            apiKeyPresent: false,
            apiKeyValid: false,
            amapApiLoaded: false,
            amapIntegrationInitialized: false,
            errors: []
        };
        this.init();
    }

    init() {
        console.log('🔍 开始高德地图调试...');
        this.checkConfig();
        this.checkApiKey();
        this.checkAmapApi();
        this.checkAmapIntegration();
        this.createDebugPanel();
        this.testAPIKey();
    }

    checkConfig() {
        try {
            if (typeof window.CONFIG !== 'undefined') {
                this.debugInfo.configLoaded = true;
                console.log('✅ 配置文件已加载');
            } else {
                this.debugInfo.errors.push('配置文件未加载');
                console.error('❌ 配置文件未加载');
            }
        } catch (error) {
            this.debugInfo.errors.push(`配置检查错误: ${error.message}`);
        }
    }

    checkApiKey() {
        try {
            if (typeof window.getAmapApiKey === 'function') {
                const apiKey = window.getAmapApiKey();
                if (apiKey && apiKey !== 'YOUR_AMAP_API_KEY') {
                    this.debugInfo.apiKeyPresent = true;
                    console.log('✅ 高德地图API密钥已配置:', apiKey.substring(0, 10) + '...');
                } else {
                    this.debugInfo.errors.push('高德地图API密钥未配置或为默认值');
                    console.error('❌ 高德地图API密钥未配置');
                }
            } else {
                this.debugInfo.errors.push('getAmapApiKey函数不存在');
            }
        } catch (error) {
            this.debugInfo.errors.push(`API密钥检查错误: ${error.message}`);
        }
    }

    checkAmapApi() {
        try {
            if (typeof AMap !== 'undefined') {
                this.debugInfo.amapApiLoaded = true;
                console.log('✅ 高德地图API已加载');
            } else {
                this.debugInfo.errors.push('高德地图API未加载');
                console.warn('⚠️ 高德地图API未加载');
            }
        } catch (error) {
            this.debugInfo.errors.push(`高德地图API检查错误: ${error.message}`);
        }
    }

    checkAmapIntegration() {
        try {
            if (typeof window.amapIntegration !== 'undefined') {
                const integration = window.amapIntegration;
                if (integration.isInitialized) {
                    this.debugInfo.amapIntegrationInitialized = true;
                    console.log('✅ 高德地图集成已初始化');
                } else {
                    console.warn('⚠️ 高德地图集成未初始化');
                }
            } else {
                this.debugInfo.errors.push('amapIntegration对象不存在');
            }
        } catch (error) {
            this.debugInfo.errors.push(`集成检查错误: ${error.message}`);
        }
    }

    // 检查高德地图API加载状态
    checkAmapAPI() {
        const results = [];
        
        // 检查基本API对象
        if (typeof AMap === 'undefined') {
            results.push({ status: 'error', message: 'AMap对象未定义 - API脚本可能未加载' });
            return results;
        }

        // 检查核心功能
        if (AMap.Map) {
            results.push({ status: 'success', message: '地图核心功能可用' });
        } else {
            results.push({ status: 'error', message: '地图核心功能不可用' });
        }

        // 服务检测提示（详细结果在下方异步服务检测中显示）
        results.push({ status: 'success', message: '服务状态采用异步检测（静态地图、地理编码）' });

        // 检查脚本标签
        const scripts = document.querySelectorAll('script[src*="amap.com"]');
        if (scripts.length > 0) {
            results.push({ status: 'success', message: `找到${scripts.length}个高德地图API脚本标签` });
        } else {
            results.push({ status: 'warning', message: '未找到高德地图API脚本标签' });
        }

        return results;
    }

    async testAPIKey() {
        const results = [];
        
        try {
            const apiKey = (window.getAmapServiceKey && window.getAmapServiceKey()) || 
                           (window.getAmapApiKey && window.getAmapApiKey()) || null;
            
            if (!apiKey || apiKey === 'YOUR_AMAP_API_KEY') {
                results.push({ status: 'error', message: 'API密钥未配置或为默认值' });
                return results;
            }

            // 测试高德地图地理编码REST服务
            const testUrl = `https://restapi.amap.com/v3/geocode/geo?address=北京市&key=${apiKey}`;
            
            try {
                const response = await fetch(testUrl);
                const data = await response.json();
                
                if (data.status === '1') {
                    results.push({ status: 'success', message: '高德地理编码API测试成功' });
                    this.debugInfo.apiKeyValid = true;
                } else {
                    results.push({ status: 'error', message: `高德地理编码API测试失败: ${data.info}` });
                }
            } catch (error) {
                results.push({ status: 'error', message: `高德地理编码API测试异常: ${error.message}` });
            }
        } catch (error) {
            results.push({ status: 'error', message: `API密钥测试错误: ${error.message}` });
        }
        
        return results;
    }

    createDebugPanel() {
        // 创建调试面板
        const debugPanel = document.createElement('div');
        debugPanel.id = 'maps-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        debugPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #4CAF50;">🗺️ 高德地图调试</h3>
                <button onclick="this.parentElement.parentElement.style.display='none'" 
                        style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    ✕
                </button>
            </div>
            <div id="debug-content">
                <div style="color: #2196F3;">正在加载调试信息...</div>
            </div>
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #333;">
                <button onclick="window.mapsDebugger.testAPIKeyAndUpdate()" 
                        style="background: #4CAF50; color: white; border: none; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    🔑 测试API密钥
                </button>
                <button onclick="window.mapsDebugger.forceRebuildMap()" 
                        style="background: #FF9800; color: white; border: none; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    🔄 重建地图
                </button>
                <button onclick="window.mapsDebugger.reinitializeMaps()" 
                        style="background: #9C27B0; color: white; border: none; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    🔄 重新初始化
                </button>
                <button onclick="window.mapsDebugger.openTestPage()" 
                        style="background: #2196F3; color: white; border: none; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    🧪 测试页面
                </button>
            </div>
        `;

        document.body.appendChild(debugPanel);
        
        // 定期更新调试信息 - 暂时禁用以避免控制台错误
        // setInterval(() => {
        //     this.updateDebugContent();
        // }, 5000);
        
        // 初始更新 - 暂时禁用
        // setTimeout(() => {
        //     this.updateDebugContent();
        // }, 1000);
    }

    async forceRebuildMap() {
        console.log('🔄 强制重建地图...');
        
        try {
            // 重新初始化2D地图
            if (window.amapIntegration && window.amapIntegration.isInitialized) {
                console.log('重新创建2D地图');
                await window.amapIntegration.create2DMap();
                console.log('✅ 地图重建完成');
            } else {
                console.warn('⚠️ 高德地图集成不可用');
            }
        } catch (error) {
            console.error('❌ 地图重建失败:', error);
        }
    }

    openTestPage() {
        window.open('test-amap.html', '_blank');
    }

    async updateDebugContent() {
        const contentDiv = document.getElementById('debug-content');
        if (!contentDiv) return;

        // 重新检查状态
        this.checkConfig();
        this.checkApiKey();
        this.checkAmapApi();
        this.checkAmapIntegration();

        // 检查高德地图API
        const apiResults = this.checkAmapAPI();

        // 检查高德地图状态
        const amapStatus = this.getAmapStatus();
        const amapKey = window.getAmapApiKey ? window.getAmapApiKey() : null;
        const amapKeyDisplay = amapKey ?
            `${amapKey.substring(0, 8)}...${amapKey.substring(amapKey.length - 4)}` :
            '未配置';

        // 获取当前活跃的地图服务
        const activeService = this.getActiveMapService();

        // 异步检测REST服务可用性
        const services = await this.checkServiceAvailability();

        let html = '<h4 style="color: #4CAF50; margin: 10px 0 5px 0;">📋 高德地图信息</h4>';
        html += `<div>配置文件: ${this.debugInfo.configLoaded ? '✅ 已加载' : '❌ 未加载'}</div>`;
        html += `<div>API密钥: ${this.debugInfo.apiKeyPresent ? '✅ 已配置' : '❌ 未配置'}</div>`;
        html += `<div>高德地图集成: ${this.debugInfo.amapIntegrationInitialized ? '✅ 已加载' : '❌ 未加载'}</div>`;
        html += `<div>API状态: ${this.debugInfo.amapApiLoaded ? '✅ 已加载' : '❌ 未加载'}</div>`;

        // 显示高德地图信息
        html += '<h4 style="color: #FF9800; margin: 15px 0 5px 0;">🗺️ 高德地图详情</h4>';
        html += `<div>集成状态: ${amapStatus.loaded ? '✅ 已加载' : '❌ 未加载'}</div>`;
        html += `<div>API密钥: ${amapKey ? '✅ 已配置' : '❌ 未配置'}</div>`;
        html += `<div>密钥显示: ${amapKeyDisplay}</div>`;
        html += `<div>初始化状态: ${amapStatus.initialized ? '✅ 已初始化' : '❌ 未初始化'}</div>`;

        // 显示活跃服务
        html += '<h4 style="color: #2196F3; margin: 15px 0 5px 0;">🌐 活跃地图服务</h4>';
        html += `<div>${activeService}</div>`;

        // 显示API检查结果
        if (apiResults.length > 0) {
            html += '<h4 style="color: #9C27B0; margin: 15px 0 5px 0;">🔍 API检查结果</h4>';
            apiResults.forEach(result => {
                const icon = result.status === 'success' ? '✅' : 
                           result.status === 'warning' ? '⚠️' : '❌';
                const color = result.status === 'success' ? '#4CAF50' : 
                            result.status === 'warning' ? '#FF9800' : '#f44336';
                html += `<div style="color: ${color};">${icon} ${result.message}</div>`;
            });
        }

        // 显示服务可用性
        html += '<h4 style="color: #00BCD4; margin: 15px 0 5px 0;">🧰 服务可用性</h4>';
        html += `<div>静态地图服务: ${services.staticMap.available ? '✅ 可用' : '⚠️ 不可用'} - ${services.staticMap.message}</div>`;
        html += `<div>地理编码服务: ${services.geocoding.available ? '✅ 可用' : '⚠️ 不可用'} - ${services.geocoding.message}</div>`;

        // 显示错误信息
        if (this.debugInfo.errors.length > 0) {
            html += '<h4 style="color: #f44336; margin: 15px 0 5px 0;">❌ 错误信息</h4>';
            this.debugInfo.errors.forEach(error => {
                html += `<div style="color: #f44336;">• ${error}</div>`;
            });
        }

        // 显示建议
        const suggestions = this.getSuggestions();
        if (suggestions.length > 0) {
            html += '<h4 style="color: #00BCD4; margin: 15px 0 5px 0;">💡 建议</h4>';
            suggestions.forEach(suggestion => {
                html += `<div style="color: #00BCD4;">• ${suggestion}</div>`;
            });
        }

        contentDiv.innerHTML = html;
    }

    async testAPIKeyAndUpdate() {
        const contentDiv = document.getElementById('debug-content');
        if (!contentDiv) return;

        // 显示测试中状态
        const testDiv = document.createElement('div');
        testDiv.style.cssText = 'margin-top: 10px; padding: 10px; background: rgba(33, 150, 243, 0.1); border-radius: 4px;';
        testDiv.innerHTML = '<div style="color: #2196F3;">🧪 正在测试高德地图API密钥...</div>';
        contentDiv.appendChild(testDiv);

        try {
            const results = await this.testAPIKey();
            
            let html = '<h4 style="color: #2196F3; margin: 0 0 5px 0;">🧪 高德地图API测试结果</h4>';
            results.forEach(result => {
                const icon = result.status === 'success' ? '✅' : '❌';
                const color = result.status === 'success' ? '#4CAF50' : '#f44336';
                html += `<div style="color: ${color};">${icon} ${result.message}</div>`;
            });
            
            testDiv.innerHTML = html;
            
            // 5秒后移除测试结果
            setTimeout(() => {
                if (testDiv.parentNode) {
                    testDiv.parentNode.removeChild(testDiv);
                }
            }, 5000);
            
        } catch (error) {
            testDiv.innerHTML = `<div style="color: #f44336;">❌ 测试失败: ${error.message}</div>`;
        }
    }

    // 获取高德地图状态
    getAmapStatus() {
        const loaded = typeof window.amapIntegration !== 'undefined';
        const integrationLoaded = typeof window.amapIntegration !== 'undefined';
        const initialized = integrationLoaded && window.amapIntegration.isInitialized;
        const keyPresent = window.getAmapApiKey && window.getAmapApiKey() !== null;

        return {
            loaded,
            initialized,
            keyPresent
        };
    }

    getActiveMapService() {
        const amapActive = window.amapIntegration && window.amapIntegration.isInitialized;

        if (amapActive) {
            return '🗺️ 高德地图';
        } else {
            return '❌ 无活跃地图服务';
        }
    }

    getSuggestions() {
        const suggestions = [];
        
        if (!this.debugInfo.configLoaded) {
            suggestions.push('请确保config.js文件正确加载');
        }
        
        if (!this.debugInfo.apiKeyPresent) {
            suggestions.push('请点击"API Setup"按钮配置高德地图API密钥');
        }
        
        if (!this.debugInfo.amapApiLoaded) {
            suggestions.push('请检查网络连接，确保能访问高德地图API');
        }

        const amapStatus = this.getAmapStatus();
        if (!amapStatus.loaded) {
            suggestions.push('请检查amap-integration.js文件是否正确加载');
        }

        if (!amapStatus.keyPresent) {
            suggestions.push('请配置高德地图API密钥');
        }

        if (!this.debugInfo.amapApiLoaded) {
            suggestions.push('高德地图API脚本未加载，请检查网络连接或API密钥');
        }

        if (this.debugInfo.errors.length > 0) {
            suggestions.push('请查看错误信息并逐一解决');
        }

        return suggestions;
    }

    async reinitializeMaps() {
        console.log('🔄 开始重新初始化高德地图...');
        
        try {
            // 清除现有集成
            if (window.amapIntegration) {
                window.amapIntegration.clearCache();
            }
            
            // 重新加载高德地图API
            await window.initializeAmapIntegration();
            
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 重新检查状态
            this.checkAmapIntegration();
            this.updateDebugContent();
            
            console.log('✅ 高德地图重新初始化完成');
            
        } catch (error) {
            console.error('❌ 重新初始化失败:', error);
        }
    }

    // ===== 新增：REST服务检测方法 =====
    async checkServiceAvailability() {
        const key = (window.getAmapServiceKey && window.getAmapServiceKey()) || 
                    (window.getAmapApiKey && window.getAmapApiKey()) || null;
        const staticMap = await this.testStaticMapViaImage(key);
        const geocoding = await this.testGeocodingViaRest(key);
        return { staticMap, geocoding };
    }

    testStaticMapViaImage(key) {
        return new Promise(resolve => {
            if (!key) {
                resolve({ available: false, message: '未配置服务密钥' });
                return;
            }
            const size = '256*256';
            const center = '116.397428,39.90923';
            const url = `https://restapi.amap.com/v3/staticmap?zoom=13&size=${size}&markers=mid,0xFF0000,${center}&key=${key}`;
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const timer = setTimeout(() => {
                resolve({ available: false, message: '请求超时或被阻止' });
            }, 6000);
            img.onload = () => {
                clearTimeout(timer);
                resolve({ available: true, message: '图片加载成功' });
            };
            img.onerror = () => {
                clearTimeout(timer);
                resolve({ available: false, message: '图片加载失败' });
            };
            img.src = url + `&ts=${Date.now()}`;
        });
    }

    async testGeocodingViaRest(key) {
        if (!key) {
            return { available: false, message: '未配置服务密钥' };
        }
        try {
            const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?address=北京市&key=${key}`);
            const data = await resp.json();
            if (data.status === '1') {
                return { available: true, message: '接口返回正常' };
            }
            return { available: false, message: data.info || '返回异常' };
        } catch (e) {
            return { available: false, message: e.message };
        }
    }
}

// 创建全局调试器实例
document.addEventListener('DOMContentLoaded', function() {
    // 延迟创建调试器，确保其他脚本已加载
    setTimeout(() => {
        window.mapsDebugger = new MapsDebugger();
    }, 2000);
});