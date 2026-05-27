/**
 * 高德地图API密钥设置工具
 * 提供简单的界面来配置高德地图API密钥
 */

class ApiSetup {
    constructor() {
        this.setupModal = null;
        this.init();
    }

    init() {
        // 检查API密钥状态
        this.checkApiKeyStatus();
        
        // 创建设置按钮
        this.createSetupButton();
        
        // 如果没有配置API密钥，显示设置提示
        if (!this.isApiKeyConfigured()) {
            this.showSetupPrompt();
        }
    }

    isApiKeyConfigured() {
        if (typeof window.getAmapApiKey === 'function') {
            const apiKey = window.getAmapApiKey();
            return apiKey && apiKey !== 'YOUR_AMAP_KEY_HERE';
        }
        return false;
    }

    checkApiKeyStatus() {
        const status = this.isApiKeyConfigured();
        console.log(`🔑 高德地图API密钥状态: ${status ? '已配置' : '未配置'}`);
        
        if (!status) {
            console.log('📝 请配置高德地图API密钥以启用完整功能');
            console.log('🔗 获取API密钥: https://console.amap.com/dev/key/app');
        }
    }

    createSetupButton() {
        // 创建容器
        const container = document.createElement('div');
        container.className = 'api-setup-container';
        
        // 创建悬停触发区域
        const trigger = document.createElement('div');
        trigger.className = 'api-setup-trigger';
        trigger.title = '高德地图设置';
        
        // 创建设置按钮
        const button = document.createElement('button');
        button.id = 'api-setup-btn';
        button.innerHTML = '⚙️ 高德地图设置';
        
        // 移除内联样式，使用CSS样式
        button.style.cssText = '';
        
        button.addEventListener('click', () => this.showSetupModal());
        
        // 组装结构
        container.appendChild(trigger);
        container.appendChild(button);
        document.body.appendChild(container);
        
        console.log('✅ 高德地图设置按钮已创建（悬停显示模式）');
    }

    showSetupPrompt() {
        // 显示设置提示
        const prompt = document.createElement('div');
        prompt.id = 'api-prompt';
        prompt.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #FF9800;
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 999;
                font-size: 14px;
            ">
                ⚠️ 需要配置高德地图API密钥以启用完整功能 
                <button onclick="document.getElementById('api-setup-btn').click()" 
                        style="margin-left: 10px; padding: 5px 10px; background: white; color: #FF9800; border: none; border-radius: 3px; cursor: pointer;">
                    立即设置
                </button>
                <button onclick="this.parentElement.remove()" 
                        style="margin-left: 5px; padding: 5px 10px; background: transparent; color: white; border: 1px solid white; border-radius: 3px; cursor: pointer;">
                    关闭
                </button>
            </div>
        `;
        document.body.appendChild(prompt);
    }

    /**
     * 显示设置模态框
     */
    showSetupModal() {
        if (this.setupModal) {
            this.setupModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'api-setup-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🗺️ 高德地图API配置</h3>
                        <button class="close-btn" onclick="this.closest('.api-setup-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="api-section">
                            <h4>📍 高德地图API密钥</h4>
                            <div class="input-group">
                                <label for="amap-key">API密钥:</label>
                                <input type="text" id="amap-key" placeholder="请输入高德地图API密钥" 
                                       value="${this.getCurrentApiKey()}" />
                                <small>
                                    <a href="https://console.amap.com/dev/key/app" target="_blank">
                                        🔗 获取高德地图API密钥
                                    </a>
                                </small>
                            </div>
                            
                            <div class="service-options">
                                <h5>启用的服务:</h5>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="elevation-service" checked>
                                    高程数据服务
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="static-maps-service" checked>
                                    静态地图服务
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="geocoding-service" checked>
                                    地理编码服务
                                </label>
                            </div>
                        </div>
                        
                        <div class="status-section">
                            <div id="setup-status" class="status-message"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="window.apiSetup.handleSaveClick()">
                            💾 保存配置
                        </button>
                        <button class="btn btn-secondary" onclick="window.apiSetup.testApiKey()">
                            🧪 测试连接
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.api-setup-modal').remove()">
                            取消
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModal = modal;
    }

    getCurrentApiKey() {
        if (typeof window.getAmapApiKey === 'function') {
            return window.getAmapApiKey() || '';
        }
        return '';
    }

    /**
     * 处理保存按钮点击
     */
    async handleSaveClick() {
        const apiKey = document.getElementById('amap-key').value.trim();
        
        if (!apiKey) {
            this.showStatus('请输入高德地图API密钥', 'error');
            return;
        }

        try {
            this.showLoadingStatus('正在保存配置...', 'info');
            
            // 保存API密钥
            await this.saveApiKey(apiKey);
            
            // 重新初始化地图服务
            await this.reinitializeMapServices();
            
            this.showStatus('✅ 配置保存成功！地图服务已重新初始化', 'success');
            
            // 2秒后关闭模态框
            setTimeout(() => {
                if (this.setupModal) {
                    this.setupModal.remove();
                    this.setupModal = null;
                }
            }, 2000);
            
        } catch (error) {
            console.error('保存配置失败:', error);
            this.showStatus(`❌ 保存失败: ${error.message}`, 'error');
        } finally {
            this.hideLoadingStatus();
        }
    }

    /**
     * 测试API密钥
     */
    async testApiKey() {
        const apiKey = document.getElementById('amap-key').value.trim();
        
        if (!apiKey) {
            this.showStatus('请先输入API密钥', 'error');
            return;
        }

        try {
            this.showLoadingStatus('正在测试API连接...', 'info');
            
            // 测试高德地图API连接
            const response = await fetch(`https://restapi.amap.com/v3/geocode/geo?key=${apiKey}&address=北京市`);
            const data = await response.json();
            
            if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
                this.showStatus('✅ API密钥测试成功！', 'success');
            } else {
                this.showStatus(`❌ API密钥测试失败: ${data.info || '未知错误'}`, 'error');
            }
            
        } catch (error) {
            console.error('API测试失败:', error);
            this.showStatus(`❌ 连接测试失败: ${error.message}`, 'error');
        } finally {
            this.hideLoadingStatus();
        }
    }

    /**
     * 重新初始化地图服务
     */
    async reinitializeMapServices() {
        try {
            console.log('🔄 重新初始化高德地图服务...');
            
            // 清理现有的地图实例
            if (window.amapIntegration && typeof window.amapIntegration.cleanup === 'function') {
                await window.amapIntegration.cleanup();
            }
            
            // 重新初始化高德地图集成
            if (typeof window.initializeAmapIntegration === 'function') {
                const success = await window.initializeAmapIntegration();
                
                if (success) {
                    console.log('✅ 高德地图服务重新初始化成功');
                    
                    // 重新初始化地图
                    if (window.amapIntegration) {
                        setTimeout(() => {
                            window.amapIntegration.create2DMap();
                        }, 1000);
                    }
                } else {
                    throw new Error('高德地图服务初始化失败');
                }
            } else {
                throw new Error('高德地图初始化函数未找到');
            }
            
        } catch (error) {
            console.error('重新初始化地图服务失败:', error);
            throw error;
        }
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('setup-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-message ${type}`;
            
            // 3秒后清除状态
            setTimeout(() => {
                if (statusElement.textContent === message) {
                    statusElement.textContent = '';
                    statusElement.className = 'status-message';
                }
            }, 3000);
        }
    }

    /**
     * 保存API密钥
     */
    async saveApiKey(apiKey) {
        try {
            // 验证API密钥格式
            if (typeof window.validateAmapApiKey === 'function') {
                const validation = window.validateAmapApiKey(apiKey);
                if (!validation.valid) {
                    throw new Error(validation.message);
                }
            }
            
            // 保存到localStorage和内存
            if (typeof window.setAmapApiKey === 'function') {
                window.setAmapApiKey(apiKey);
            } else {
                // 直接保存到localStorage作为后备
                localStorage.setItem('amap_api_key', apiKey);
            }
            
            console.log('✅ 高德地图API密钥已保存');
            
        } catch (error) {
            console.error('保存API密钥失败:', error);
            throw error;
        }
    }

    showLoadingStatus(message, type = 'info') {
        const statusElement = document.getElementById('setup-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="loading-spinner"></div>
                <span>${message}</span>
            `;
            statusElement.className = `status-message ${type} loading`;
        }
    }

    hideLoadingStatus() {
        const statusElement = document.getElementById('setup-status');
        if (statusElement) {
            statusElement.innerHTML = '';
            statusElement.className = 'status-message';
        }
    }

    /**
     * 更新配置文件（仅用于显示，实际不修改文件）
     */
    updateConfigFile(apiKey) {
        console.log('💡 提示: API密钥已保存到浏览器存储');
        console.log('💡 如需永久保存，请手动更新 js/config.js 文件中的 AMAP.API_KEY 值');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.apiSetup = new ApiSetup();
});