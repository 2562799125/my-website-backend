// 矿山切换控制器
class MineController {
    constructor() {
        this.currentMine = null; // 不设置默认矿山，由用户选择
        this.mineSelector = null;
        this.switchButton = null;
        this.mineInfo = {
            type: null,
            location: null,
            production: null
        };
        
        this.init();
    }

    // 初始化控制器
    init() {
        this.setupElements();
        this.setupEventListeners();
        
        // 初始化时读取选择器的当前值
        if (this.mineSelector && this.mineSelector.value) {
            this.currentMine = this.mineSelector.value;
            console.log('🎯 初始化时设置当前矿山:', this.currentMine);
        }
        
        this.updateMineInfo();
    }

    // 设置DOM元素
    setupElements() {
        this.mineSelector = document.getElementById('mine-selector');
        this.switchButton = document.getElementById('switch-mine-btn');
        this.mineInfo.type = document.getElementById('mine-type');
        this.mineInfo.location = document.getElementById('mine-location');
        this.mineInfo.production = document.getElementById('mine-production');
        
        // 地图上方的矿山信息元素
        this.mineInfo.typeMap = document.getElementById('mine-type-map');
        this.mineInfo.locationMap = document.getElementById('mine-location-map');
        this.mineInfo.productionMap = document.getElementById('mine-production-map');
    }

    // 设置事件监听器
    setupEventListeners() {
        if (this.mineSelector) {
            this.mineSelector.addEventListener('change', (e) => {
                this.currentMine = e.target.value;
                console.log('🎯 矿山选择器变更，新选择:', this.currentMine);
                this.updateMineInfo();
                // 选择矿山后立即跳转
                if (this.currentMine) {
                    this.jumpToMineDirectly(this.currentMine);
                }
            });
        }

        if (this.switchButton) {
            this.switchButton.addEventListener('click', () => {
                this.switchMine();
            });
        }
    }

    // 更新矿山信息显示
    updateMineInfo() {
        const realMineData = window.DataManager?.getRealMineData();
        if (!realMineData || !realMineData.mines) return;

        // 如果没有选择矿山，清空显示
        if (!this.currentMine) {
            this.clearMineInfo();
            return;
        }

        const mine = realMineData.mines.find(m => m.id === this.currentMine);
        if (!mine) {
            console.warn('未找到矿山数据:', this.currentMine);
            this.clearMineInfo();
            return;
        }

        // 更新显示信息
        if (this.mineInfo.type) {
            this.mineInfo.type.textContent = this.getMineTypeText(mine.type);
        }
        
        if (this.mineInfo.location) {
            this.mineInfo.location.textContent = mine.location;
        }
        
        if (this.mineInfo.production) {
            this.mineInfo.production.textContent = this.formatProduction(mine.production);
        }
        
        // 同时更新地图上方的矿山信息
        if (this.mineInfo.typeMap) {
            this.mineInfo.typeMap.textContent = this.getMineTypeText(mine.type);
        }
        
        if (this.mineInfo.locationMap) {
            this.mineInfo.locationMap.textContent = mine.location;
        }
        
        if (this.mineInfo.productionMap) {
            this.mineInfo.productionMap.textContent = this.formatProduction(mine.production);
        }
    }

    // 清空矿山信息显示
    clearMineInfo() {
        const defaultText = '请选择矿山';
        
        if (this.mineInfo.type) {
            this.mineInfo.type.textContent = defaultText;
        }
        
        if (this.mineInfo.location) {
            this.mineInfo.location.textContent = defaultText;
        }
        
        if (this.mineInfo.production) {
            this.mineInfo.production.textContent = defaultText;
        }
        
        // 同时清空地图上方的矿山信息
        if (this.mineInfo.typeMap) {
            this.mineInfo.typeMap.textContent = defaultText;
        }
        
        if (this.mineInfo.locationMap) {
            this.mineInfo.locationMap.textContent = defaultText;
        }
        
        if (this.mineInfo.productionMap) {
            this.mineInfo.productionMap.textContent = defaultText;
        }
    }

    // 获取矿山类型文本
    getMineTypeText(type) {
        const typeMap = {
            'open_pit': '露天矿',
            'underground': '地下矿',
            'strip_mine': '露天条带矿',
            'placer': '砂矿'
        };
        return typeMap[type] || type;
    }

    // 格式化产量显示
    formatProduction(production) {
        if (production >= 1000000) {
            return `${(production / 1000000).toFixed(1)}M吨/年`;
        } else if (production >= 1000) {
            return `${(production / 1000).toFixed(0)}K吨/年`;
        } else {
            return `${production}吨/年`;
        }
    }

    // 切换矿山
    async switchMine() {
        console.log('🔄 MineController.switchMine 开始，当前矿山ID:', this.currentMine);
        
        // 检查矿山ID是否有效
        if (!this.currentMine) {
            console.error('❌ 矿山ID为空，无法切换');
            return;
        }
        
        console.log('🔍 检查DataManager存在性:', !!window.DataManager);
        console.log('🔍 检查amapIntegration存在性:', !!window.amapIntegration);
        
        // 显示加载状态
        this.showLoadingState();

        // 切换矿山数据
        if (window.DataManager) {
            console.log('📊 调用DataManager.switchMine...');
            window.DataManager.switchMine(this.currentMine);
            
            // 验证切换是否成功
            const currentMineInfo = window.DataManager.getCurrentMineInfo();
            console.log('✅ 切换后的矿山信息:', currentMineInfo);
        } else {
            console.error('❌ DataManager不可用');
        }

        // 直接更新地图数据（立即跳转）
        if (window.amapIntegration) {
            console.log('🗺️ 调用amapIntegration.updateMapData...');
            window.amapIntegration.updateMapData();
            console.log(`🚀 地图更新命令已发送`);
        } else {
            console.error('❌ amapIntegration不可用');
        }

        // 更新图表数据
        this.updateDashboardData();

        // 隐藏加载状态
        setTimeout(() => {
            this.hideLoadingState();
            this.showSwitchSuccess();
        }, 500); // 缩短加载时间
    }

    // 显示加载状态
    showLoadingState() {
        if (this.switchButton) {
            this.switchButton.textContent = '切换中...';
            this.switchButton.disabled = true;
            this.switchButton.style.opacity = '0.6';
        }
    }

    // 隐藏加载状态
    hideLoadingState() {
        if (this.switchButton) {
            this.switchButton.textContent = '切换矿山';
            this.switchButton.disabled = false;
            this.switchButton.style.opacity = '1';
        }
    }

    // 显示切换成功提示
    showSwitchSuccess() {
        const realMineData = window.DataManager.getRealMineData();
        const mine = realMineData.mines.find(m => m.id === this.currentMine);
        
        // 创建提示消息
        const notification = document.createElement('div');
        notification.className = 'mine-switch-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✓</span>
                <span class="notification-text">已切换到 ${mine.name}</span>
            </div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(90deg, #00d4ff 0%, #0099cc 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后移除提示
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }



    // 更新仪表板数据
    updateDashboardData() {
        // 更新设备列表
        if (window.updateEquipmentList) {
            window.updateEquipmentList();
        }
        
        // 更新图表
        if (window.updateCharts) {
            window.updateCharts();
        }
        
        // 更新实时数据
        if (window.updateRealTimeData) {
            window.updateRealTimeData();
        }
        
        console.log('仪表板数据已更新');
    }

    // 获取当前选中的矿山
    getCurrentMine() {
        return this.currentMine;
    }

    // 设置矿山选择
    setMine(mineId) {
        if (this.mineSelector) {
            this.mineSelector.value = mineId;
            this.currentMine = mineId;
            this.updateMineInfo();
        }
    }

    // 直接跳转到矿山坐标
    jumpToMineDirectly(mineId) {
        console.log('🚀 直接跳转到矿山:', mineId);
        
        // 固定的矿山坐标数据
        const mineCoordinates = {
            'mine_003': { lng: 111.1851, lat: 39.8612, name: '内蒙古准格尔煤矿' },
            'mine_004': { lng: 111.9876, lat: 39.7234, name: '内蒙古黑岱沟露天煤矿' },
            'mine_006': { lng: 106.4833, lat: 29.5833, name: '重庆重钢歌乐山矿' }
        };
        
        const mineData = mineCoordinates[mineId];
        if (mineData && window.amapIntegration) {
            console.log(`📍 跳转到 ${mineData.name}: [${mineData.lng}, ${mineData.lat}]`);
            window.amapIntegration.jumpToMine(mineData);
            
            // 同时更新数据管理器
            if (window.DataManager) {
                window.DataManager.switchMine(mineId);
            }
        } else {
            console.error('❌ 矿山坐标数据不存在或地图集成不可用:', mineId);
        }
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-icon {
        font-size: 18px;
        font-weight: bold;
    }
    
    .notification-text {
        font-size: 14px;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// 创建全局实例并初始化
window.mineController = new MineController();
window.mineController.init();