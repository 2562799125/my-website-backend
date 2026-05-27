// 矿山可视化监管平台 - 主应用程序
class MiningPlatform {
    constructor() {
        this.currentSection = 'dashboard';
        this.chartsManager = null;
        this.dataManager = null;
        this.monitoringManager = null;
        this.isInitialized = false;
    }

    // 初始化应用程序
    async init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.startRealTimeUpdates();
        this.initializeDateTime();
        this.initializeControls();
        this.initializeLayoutProtection(); // 启用页面布局保护
        
        // 自动初始化地图
        await this.initializeMap();
        
        this.isInitialized = true;
        console.log('矿山可视化监管平台已初始化');
    }

    // 初始化地图
    async initializeMap() {
        try {
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer) {
                mapContainer.classList.add('show-2d');
                
                // 等待地图集成模块加载
                let retryCount = 0;
                const maxRetries = 10;
                
                while (!window.amapIntegration && retryCount < maxRetries) {
                    console.log(`等待地图集成模块加载... (${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 100));
                    retryCount++;
                }
                
                if (window.amapIntegration) {
                    // 初始化地图集成模块
                    await window.amapIntegration.initialize();
                    
                    // 创建2D地图
                    await window.amapIntegration.create2DMap('amap-container');
                    console.log('地图已自动初始化');
                    
                    // 等待地图完全加载后显示内蒙古矿山标记
                    setTimeout(() => {
                        if (window.amapIntegration && window.amapIntegration.map) {
                            window.amapIntegration.showInnerMongoliaMines();
                            console.log('✅ 内蒙古矿山标记已显示');
                        }
                    }, 1000);
                } else {
                    console.warn('地图集成模块加载超时');
                }
            }
        } catch (error) {
            console.error('地图初始化失败:', error);
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 导航菜单点击事件
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log('找到导航按钮数量:', navButtons.length);
        
        navButtons.forEach((btn, index) => {
            const target = btn.getAttribute('data-target');
            console.log(`按钮 ${index + 1}: data-target="${target}"`);
            
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('按钮被点击:', target);
                const section = btn.getAttribute('data-target');
                await this.switchSection(section);
            });
        });

        // 窗口大小改变事件
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // 全屏按钮事件
        this.initializeFullscreenButton();
        
        // 地图缩放控制按钮事件
        this.initializeZoomControls();
    }

    // 切换页面部分
    async switchSection(sectionName) {
        console.log('🔄 切换到模块:', sectionName);
        console.log('📍 当前时间:', new Date().toLocaleTimeString());
        console.log('📊 DataManager 状态:', !!this.dataManager);
        
        // 隐藏所有部分
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // 移除所有导航按钮的活动状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 显示目标部分
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }

        // 激活对应的导航按钮
        const activeBtn = document.querySelector(`[data-target="${sectionName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // 更新侧边栏内容
        this.updateSidebarContent(sectionName);

        // 根据部分执行特定初始化
        await this.initializeSectionSpecific(sectionName);

        // 更新URL（可选）
        history.pushState({section: sectionName}, '', `#${sectionName}`);
    }

    // 初始化特定部分的功能
    async initializeSectionSpecific(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'monitoring':
                this.initializeMonitoring();
                break;
            case 'equipment':
                this.initializeEquipment();
                break;
            case 'safety':
                this.initializeSafety();
                break;
            case 'reports':
                this.initializeReports();
                break;
        }
    }

    // 更新侧边栏内容
    updateSidebarContent(sectionName) {
        console.log('🎯 切换到:', sectionName);
        
        if (!this.dataManager) {
            console.error('❌ DataManager 未初始化');
            return;
        }
        
        const themeContents = this.dataManager.getThemeContents(sectionName);
        console.log('📊 获取主题内容:', !!themeContents);
        
        if (!themeContents) {
            console.error('❌ 未找到主题内容:', sectionName);
            return;
        }

        // 获取状态栏面板元素
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');
        
        if (!leftPanel || !rightPanel) {
            console.error('❌ 未找到状态栏面板元素');
            return;
        }

        console.log('🔄 开始更新状态栏内容...');
        
        // 添加过渡效果类
        leftPanel.classList.add('panel-updating');
        rightPanel.classList.add('panel-updating');
        
        // 显示加载指示器
        this.showPanelLoading(leftPanel, rightPanel);
        
        // 延迟更新以显示过渡效果
        setTimeout(() => {
            // 更新左侧面板（替换原有内容）
            this.updateLeftPanel(themeContents.left);
            
            // 更新右侧面板（替换原有内容）
            this.updateRightPanel(themeContents.right);
            
            // 移除加载状态
            this.hidePanelLoading(leftPanel, rightPanel);
            
            // 移除过渡效果类
            setTimeout(() => {
                leftPanel.classList.remove('panel-updating');
                rightPanel.classList.remove('panel-updating');
                console.log('✅ 状态栏内容替换完成');
            }, 300);
        }, 150);
    }

    // 更新左侧面板内容
    updateLeftPanel(leftContent) {
        console.log('🔄 更新左侧面板内容');
        const leftPanel = document.querySelector('.left-panel');
        if (!leftPanel || !leftContent) {
            console.error('❌ updateLeftPanel 失败:', { leftPanel: !!leftPanel, leftContent: !!leftContent });
            return;
        }

        // 测试：先显示一个简单的测试内容
        leftPanel.innerHTML = '<div style="padding: 20px; background: #f0f0f0; margin: 10px; border-radius: 5px;">🔄 正在加载左侧内容...</div>';
        console.log('✅ 左侧面板测试内容已设置');
        
        // 延迟一秒后设置真实内容
        setTimeout(() => {
            // 清空现有内容（包括占位符）
            leftPanel.innerHTML = '';
            console.log('✅ 左侧面板内容已清空');

            // 添加矿山选择器（保持不变）
            leftPanel.appendChild(this.createMineSelector());

            // 根据主题内容添加各个部分
            leftContent.sections.forEach(section => {
                const sectionElement = this.createPanelSection(section);
                leftPanel.appendChild(sectionElement);
            });

            console.log('✅ 左侧面板内容更新完成，添加了', leftContent.sections.length, '个部分');

            // 重新绑定矿山切换按钮事件
            this.rebindMineSelector();
        }, 1000);
    }

    // 更新右侧面板内容
    updateRightPanel(rightContent) {
        console.log('🔄 更新右侧面板内容');
        const rightPanel = document.querySelector('.right-panel');
        if (!rightPanel || !rightContent) {
            console.error('❌ updateRightPanel 失败:', { rightPanel: !!rightPanel, rightContent: !!rightContent });
            return;
        }

        // 测试：先显示一个简单的测试内容
        rightPanel.innerHTML = '<div style="padding: 20px; background: #e8f4fd; margin: 10px; border-radius: 5px;">📊 正在加载右侧内容...</div>';
        console.log('✅ 右侧面板测试内容已设置');
        
        // 延迟一秒后设置真实内容
        setTimeout(() => {
            // 清空现有内容（包括占位符）
            rightPanel.innerHTML = '';
            console.log('✅ 右侧面板内容已清空');

            // 根据主题内容添加各个部分
            rightContent.sections.forEach(section => {
                const sectionElement = this.createPanelSection(section);
                rightPanel.appendChild(sectionElement);
            });

            console.log('✅ 右侧面板内容更新完成，添加了', rightContent.sections.length, '个部分');
        }, 1000);
    }

    // 创建矿山选择器
    createMineSelector() {
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'panel-section';
        selectorDiv.innerHTML = `
            <h3 class="section-title">数字孪生矿山</h3>
            <div class="mine-selector">
                <select id="mine-selector" class="mine-select">
                    <option value="mine_003" selected>内蒙古准格尔煤矿</option>
                    <option value="mine_004">内蒙古黑岱沟露天煤矿</option>
                    <option value="mine_006">重庆重钢歌乐山矿</option>
                </select>
                <button id="switch-mine-btn" class="control-btn">切换矿山</button>
            </div>
        `;
        return selectorDiv;
    }

    // 创建面板部分
    createPanelSection(section) {
        console.log('📝 创建面板部分:', section.title);
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'panel-section';
        
        let sectionHTML = `<h3 class="section-title">${section.title}</h3>`;
        
        if (section.type === 'monitoring') {
            sectionHTML += '<div class="monitoring-data">';
            section.items.forEach(item => {
                sectionHTML += `
                    <div class="monitor-item">
                        <div class="monitor-label">${item.label}</div>
                        <div class="monitor-value">${item.value}</div>
                        <div class="monitor-bar">
                            <div class="monitor-progress" style="width: ${item.progress || 50}%"></div>
                        </div>
                    </div>
                `;
            });
            sectionHTML += '</div>';
        } else if (section.type === 'status') {
            sectionHTML += '<div class="status-data">';
            section.items.forEach(item => {
                const statusClass = this.getEcologicalStatusClass(item.status);
                const trendIcon = this.getTrendIcon(item.trend);
                sectionHTML += `
                    <div class="status-item">
                        <div class="status-info">
                            <div class="status-label">${item.label}</div>
                            <div class="status-value">${item.value}</div>
                            <div class="status-badge ${statusClass}">${item.status}</div>
                            ${item.trend ? `<div class="trend-icon ${item.trend}">${trendIcon}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            sectionHTML += '</div>';
        } else if (section.type === 'equipment') {
            sectionHTML += '<div class="equipment-data">';
            section.items.forEach(item => {
                sectionHTML += `
                    <div class="equipment-item">
                        <div class="equipment-info">
                            <div class="equipment-name">${item.name}</div>
                            <div class="equipment-status ${item.status}">${item.statusText}</div>
                            <div class="equipment-value">${item.value}</div>
                        </div>
                    </div>
                `;
            });
            sectionHTML += '</div>';
        } else if (section.type === 'safety') {
            sectionHTML += '<div class="safety-monitoring">';
            section.items.forEach(item => {
                sectionHTML += `
                    <div class="safety-item">
                        <div class="safety-icon">${item.icon}</div>
                        <div class="safety-info">
                            <div class="safety-label">${item.label}</div>
                            <div class="safety-value">${item.value}</div>
                            <div class="safety-status ${item.status}">${item.statusText}</div>
                        </div>
                    </div>
                `;
            });
            sectionHTML += '</div>';
        }
        
        sectionDiv.innerHTML = sectionHTML;
        console.log('✅ 面板部分创建完成:', section.title);
        return sectionDiv;
    }

    // 显示面板加载状态
    showPanelLoading(leftPanel, rightPanel) {
        const loadingHTML = `
            <div class="panel-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载中...</div>
            </div>
        `;
        
        // 为左右面板添加加载指示器
        if (leftPanel) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'panel-loading-overlay';
            loadingDiv.innerHTML = loadingHTML;
            leftPanel.appendChild(loadingDiv);
        }
        
        if (rightPanel) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'panel-loading-overlay';
            loadingDiv.innerHTML = loadingHTML;
            rightPanel.appendChild(loadingDiv);
        }
    }

    // 隐藏面板加载状态
    hidePanelLoading(leftPanel, rightPanel) {
        if (leftPanel) {
            const loadingOverlay = leftPanel.querySelector('.panel-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        }
        
        if (rightPanel) {
            const loadingOverlay = rightPanel.querySelector('.panel-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        }
    }

    // 重新绑定矿山选择器事件
    rebindMineSelector() {
        const switchBtn = document.getElementById('switch-mine-btn');
        const mineSelector = document.getElementById('mine-selector');
        
        if (switchBtn && mineSelector) {
            // 移除旧的事件监听器（如果存在）
            switchBtn.replaceWith(switchBtn.cloneNode(true));
            const newSwitchBtn = document.getElementById('switch-mine-btn');
            
            // 添加新的事件监听器
            newSwitchBtn.addEventListener('click', () => {
                if (window.mineController) {
                    const selectedMine = mineSelector.value;
                    console.log('🎯 选择的矿山ID:', selectedMine);
                    
                    // 先设置当前矿山，然后调用切换
                    window.mineController.setMine(selectedMine);
                    window.mineController.switchMine();
                }
            });
        }
    }

    // 初始化仪表板
    initializeDashboard() {
        console.log('初始化仪表板');
        // 这里会调用charts.js中的函数
        if (window.ChartsManager) {
            window.ChartsManager.initProductionChart();
        }
    }



    // 初始化监控
    initializeMonitoring() {
        console.log('初始化实时监控');
        // 这里会调用monitoring.js中的函数
        if (window.MonitoringManager) {
            window.MonitoringManager.init();
        }
    }

    // 初始化设备管理
    initializeEquipment() {
        console.log('初始化设备管理');
        this.loadEquipmentData();
    }

    // 初始化安全系统
    initializeSafety() {
        console.log('初始化安全预警系统');
        this.loadSafetyData();
    }

    // 初始化报表
    initializeReports() {
        console.log('初始化数据报表');
        this.setupReportFilters();
        if (window.ChartsManager) {
            window.ChartsManager.initReportChart();
        }
    }

    // 初始化组件
    initializeComponents() {
        // 初始化数据管理器
        this.dataManager = window.DataManager;
        console.log('DataManager 初始化状态:', !!this.dataManager);
        
        // 初始化图表管理器
        this.chartsManager = window.ChartsManager || new ChartsManager();
        
        // 初始化监控管理器
        this.monitoringManager = window.MonitoringManager || new MonitoringManager();
        
        this.initializeTooltips();
        this.initializeAnimations();
        this.loadInitialData();
        
        // 监听数据更新事件
        this.setupDataUpdateListener();
        
        console.log('所有组件初始化完成');
    }

    // 初始化日期时间控件
    initializeDateTime() {
        const now = new Date();
        const dateTimeElements = document.querySelectorAll('.datetime-display');
        dateTimeElements.forEach(element => {
            element.textContent = now.toLocaleString('zh-CN');
        });
    }

    // 初始化页面布局保护
    initializeLayoutProtection() {
        // 保护关键元素不被删除或修改
        const protectedElements = [
            '.map-bottom-nav',
            '.left-panel',
            '.right-panel',
            '.map-container',
            '.main-content'
        ];

        protectedElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // 添加保护属性
                element.setAttribute('data-protected', 'true');
                
                // 防止被删除
                const originalRemove = element.remove;
                element.remove = function() {
                    console.warn(`尝试删除受保护的元素: ${selector}`);
                    return false;
                };

                // 防止innerHTML被清空
                const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
                Object.defineProperty(element, 'innerHTML', {
                    get: originalInnerHTML.get,
                    set: function(value) {
                        if (this.getAttribute('data-protected') === 'true' && value === '') {
                            console.warn(`尝试清空受保护元素的内容: ${selector}`);
                            return;
                        }
                        originalInnerHTML.set.call(this, value);
                    }
                });

                // 监听DOM变化
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                            mutation.removedNodes.forEach((node) => {
                                if (node.nodeType === Node.ELEMENT_NODE && 
                                    node.getAttribute && 
                                    node.getAttribute('data-protected') === 'true') {
                                    console.warn('检测到受保护元素被移除，正在恢复...');
                                    // 这里可以添加恢复逻辑
                                }
                            });
                        }
                    });
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        });

        console.log('页面布局保护系统已启用');
    }

    // 初始化控件
    initializeControls() {
        // 初始化搜索功能
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        });

        // 初始化筛选器
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleFilter(e.target.value);
            });
        });

        // 底部导航按钮交互：与参考图一致的四个入口
        const bottomNav = document.querySelector('.map-bottom-nav');
        console.log('底部导航容器:', bottomNav);
        
        if (bottomNav) {
            const navButtons = bottomNav.querySelectorAll('.nav-btn');
            console.log('找到底部导航按钮数量:', navButtons.length);
            
            navButtons.forEach((btn, index) => {
                console.log(`按钮 ${index}:`, btn, 'data-target:', btn.getAttribute('data-target'));
                
                btn.addEventListener('click', async (e) => {
                    console.log('按钮被点击:', btn, 'data-target:', btn.getAttribute('data-target'));
                    
                    bottomNav.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const target = btn.getAttribute('data-target');
                    if (target) {
                        console.log('调用 switchSection:', target);
                        await this.switchSection(target);
                    } else {
                        console.error('按钮没有 data-target 属性');
                    }
                });
            });
        } else {
            console.error('未找到底部导航容器 .map-bottom-nav');
        }

        // 地图控制功能
        this.initializeMapControls();
        
        // 初始化隐藏式地图切换按钮
        this.initializeMapToggleButton();
    }

    // 初始化地图控制
    initializeMapControls() {
        // 缩放控制
        const zoomInBtn = document.querySelector('.zoom-in');
        const zoomOutBtn = document.querySelector('.zoom-out');
        const resetBtn = document.querySelector('.reset-view');

        const mapContainer = document.querySelector('.map-container');
        const mapBtns = document.querySelectorAll('.map-controls .map-btn');

        const isShow2D = () => mapContainer && mapContainer.classList.contains('show-2d');
        const ensure2DMap = async (satellite = false) => {
            try {
                if (!window.amapIntegration) return;
                if (!window.amapIntegration.isMapCreated || !window.amapIntegration.map) {
                    await window.amapIntegration.create2DMap('amap-container');
                }
                window.amapIntegration.toggleSatellite(!!satellite);
            } catch (e) {
                console.error('初始化2D地图失败:', e);
            }
        };
        const resize2DMap = () => {
            try {
                if (window.amapIntegration?.map) {
                    // 在容器显示状态变更后，主动触发尺寸重计算，避免瓦片请求被取消
                    window.amapIntegration.map.resize();
                }
            } catch (_) {}
        };
        const setActiveBtn = (index) => {
            mapBtns.forEach((btn, i) => {
                if (i === index) btn.classList.add('active');
                else btn.classList.remove('active');
            });
        };

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', async () => {
                if (isShow2D() && window.amapIntegration?.map) {
                    window.amapIntegration.map.zoomIn();
                }
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', async () => {
                if (isShow2D() && window.amapIntegration?.map) {
                    window.amapIntegration.map.zoomOut();
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                if (isShow2D() && window.amapIntegration) {
                    const mine = window.amapIntegration.getCurrentMineInfo();
                    const zoom = window.amapIntegration.calculateZoomLevel(mine.bounds);
                    if (window.amapIntegration.map) {
                        window.amapIntegration.map.setZoomAndCenter(zoom, [mine.lng, mine.lat]);
                    }
                }
            });
        }

        // 图层控制
        const layerBtns = document.querySelectorAll('.layer-btn');
        layerBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layer = e.target.dataset.layer;
                this.toggleLayer(layer);
                btn.classList.toggle('active');
            });
        });

        // 地图视图切换：2D / 卫星
        if (mapBtns && mapBtns.length >= 2 && mapContainer) {
            const btn2D = mapBtns[0];
            const btnSat = mapBtns[1];

            // 2D平面
            btn2D.addEventListener('click', async () => {
                setActiveBtn(0);
                resize2DMap();
                await ensure2DMap(false);
            });

            // 卫星图
            btnSat.addEventListener('click', async () => {
                setActiveBtn(1);
                resize2DMap();
                await ensure2DMap(true);
            });

            // 默认进入2D
            (async () => {
                setActiveBtn(0);
                resize2DMap();
                await ensure2DMap(false);
            })();
        }
    }

    // 初始化隐藏式地图切换按钮
    initializeMapToggleButton() {
        const toggleContainer = document.getElementById('mapToggleContainer');
        const toggleTrigger = document.getElementById('mapToggleTrigger');
        const toggleOptions = document.getElementById('mapToggleOptions');
        
        if (!toggleContainer || !toggleTrigger || !toggleOptions) {
            console.warn('地图切换按钮元素未找到');
            return;
        }

        let isExpanded = false;
        let hoverTimeout = null;

        // 展开/收起功能
        const expandOptions = () => {
            if (!isExpanded) {
                toggleContainer.classList.add('expanded');
                isExpanded = true;
            }
        };

        const collapseOptions = () => {
            if (isExpanded) {
                toggleContainer.classList.remove('expanded');
                isExpanded = false;
            }
        };

        // 鼠标悬停事件
        toggleContainer.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            expandOptions();
        });

        toggleContainer.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                collapseOptions();
            }, 300); // 300ms延迟收起
        });

        // 点击触发按钮切换展开状态
        toggleTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isExpanded) {
                collapseOptions();
            } else {
                expandOptions();
            }
        });

        // 地图模式切换功能
        const mapOptions = toggleOptions.querySelectorAll('.map-toggle-option');
        mapOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                const mode = option.getAttribute('data-mode');
                
                // 更新选中状态
                mapOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // 执行地图切换
                await this.switchMapMode(mode);
                
                // 切换后收起选项
                setTimeout(() => {
                    collapseOptions();
                }, 200);
            });
        });

        // 点击页面其他地方收起选项
        document.addEventListener('click', (e) => {
            if (!toggleContainer.contains(e.target)) {
                collapseOptions();
            }
        });

        console.log('地图切换按钮已初始化');
    }

    // 地图模式切换方法
    async switchMapMode(mode) {
        const mapContainer = document.querySelector('.map-container');
        
        try {
            switch (mode) {
                case 'satellite':
                    // 切换到卫星地图
                    if (mapContainer) {
                        mapContainer.classList.add('show-2d');
                        
                        if (!window.amapIntegration) return;
                        if (!window.amapIntegration.isMapCreated || !window.amapIntegration.map) {
                            await window.amapIntegration.create2DMap('amap-container');
                        }
                        window.amapIntegration.toggleSatellite(true);
                        
                        // 触发地图尺寸重计算
                        setTimeout(() => {
                            if (window.amapIntegration?.map) {
                                window.amapIntegration.map.resize();
                            }
                        }, 100);
                    }
                    console.log('已切换到卫星地图模式');
                    break;
                    
                case 'standard':
                    // 切换到标准地图
                    if (mapContainer) {
                        mapContainer.classList.add('show-2d');
                        
                        if (!window.amapIntegration) return;
                        if (!window.amapIntegration.isMapCreated || !window.amapIntegration.map) {
                            await window.amapIntegration.create2DMap('amap-container');
                        }
                        window.amapIntegration.toggleSatellite(false);
                        
                        // 触发地图尺寸重计算
                        setTimeout(() => {
                            if (window.amapIntegration?.map) {
                                window.amapIntegration.map.resize();
                            }
                        }, 100);
                    }
                    console.log('已切换到标准地图模式');
                    break;
                    

                    
                default:
                    console.warn('未知的地图模式:', mode);
            }
        } catch (error) {
            console.error('地图模式切换失败:', error);
        }
    }

    // 切换图层显示（2D地图）
    toggleLayer(layerName) {
        // 2D地图图层控制
        console.log('切换图层:', layerName);
    }

    // 处理搜索
    handleSearch(query) {
        console.log('搜索:', query);
        // 实现搜索逻辑
    }

    // 处理筛选
    handleFilter(filterValue) {
        console.log('筛选:', filterValue);
        // 实现筛选逻辑
    }

    // 更新人员信息
    updatePersonnelInfo() {
        const personnelData = this.dataManager.getPersonnelData();
        
        // 更新人员头像和信息
        const personnelName = document.querySelector('.personnel-name');
        const personnelStatus = document.querySelector('.personnel-status');
        
        if (personnelName) personnelName.textContent = personnelData.name || '张工程师';
        if (personnelStatus) personnelStatus.textContent = personnelData.status || '在线';
        
        // 更新人员统计
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach((item, index) => {
            const valueElement = item.querySelector('.stat-value');
            if (valueElement) {
                switch(index) {
                    case 0:
                        valueElement.textContent = personnelData.workHours || '8.5h';
                        break;
                    case 1:
                        valueElement.textContent = personnelData.efficiency || '95%';
                        break;
                    case 2:
                        valueElement.textContent = personnelData.tasks || '12';
                        break;
                }
            }
        });
    }

    // 更新监控数据
    updateMonitoringData() {
        const monitoringData = this.dataManager.getMonitoringData();
        
        const monitorItems = document.querySelectorAll('.monitor-item');
        monitorItems.forEach((item, index) => {
            const valueElement = item.querySelector('.monitor-value');
            const progressElement = item.querySelector('.monitor-progress');
            
            if (valueElement && progressElement) {
                const data = monitoringData[index];
                if (data) {
                    valueElement.textContent = data.value;
                    progressElement.style.width = data.percentage + '%';
                }
            }
        });
    }

    // 更新圆形进度条
    updateCircularProgress() {
        const progressData = this.dataManager.getProgressData();
        
        const progressCircles = document.querySelectorAll('.progress-circle');
        progressCircles.forEach((circle, index) => {
            const textElement = circle.querySelector('.progress-text');
            const data = progressData[index];
            
            if (textElement && data) {
                textElement.textContent = data.value + '%';
                circle.style.setProperty('--percent', data.value * 3.6 + 'deg');
            }
        });
    }

    // 更新设备列表
    updateEquipmentList() {
        const equipmentData = this.dataManager.getEquipmentData();
        const equipmentList = document.querySelector('.equipment-list');
        
        if (equipmentList && equipmentData) {
            equipmentList.innerHTML = '';
            
            equipmentData.forEach(equipment => {
                const equipmentItem = document.createElement('div');
                equipmentItem.className = 'equipment-item';
                equipmentItem.innerHTML = `
                    <div class="equipment-icon">${equipment.icon}</div>
                    <div class="equipment-info">
                        <div class="equipment-name">${equipment.name}</div>
                        <div class="equipment-status ${equipment.status}">${equipment.statusText}</div>
                    </div>
                    <div class="equipment-value">${equipment.value}</div>
                `;
                equipmentList.appendChild(equipmentItem);
            });
        }
    }

    // 更新告警列表
    updateAlertList() {
        const alertData = this.dataManager.getAlertData();
        const alertList = document.querySelector('.alert-list');
        
        if (alertList && alertData) {
            alertList.innerHTML = '';
            
            alertData.slice(0, 5).forEach(alert => {
                const alertItem = document.createElement('div');
                alertItem.className = `alert-item ${alert.level}`;
                alertItem.innerHTML = `
                    <div class="alert-icon">${alert.icon}</div>
                    <div class="alert-content">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-time">${alert.time}</div>
                    </div>
                `;
                alertList.appendChild(alertItem);
            });
        }
    }

    // 更新数据表格
    updateDataTable() {
        const tableData = this.dataManager.getTableData();
        const tableBody = document.querySelector('#monitoring-table tbody');
        
        if (tableBody && tableData) {
            tableBody.innerHTML = '';
            
            tableData.forEach(row => {
                const tr = document.createElement('tr');
                const statusClass = this.getEcologicalStatusClass(row.status);
                const trendIcon = this.getTrendIcon(row.trend);
                
                tr.innerHTML = `
                    <td>${row.point}</td>
                    <td>${row.indicator}</td>
                    <td>${row.value} ${trendIcon}</td>
                    <td><span class="status-badge ${statusClass}">${row.statusText}</span></td>
                    <td>${row.time}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // 获取生态状态样式类
    getEcologicalStatusClass(status) {
        const statusClasses = {
            'good': 'good',
            'normal': 'normal',
            'warning': 'warning',
            'danger': 'danger'
        };
        return statusClasses[status] || 'normal';
    }

    // 获取趋势图标
    getTrendIcon(trend) {
        const trendIcons = {
            'up': '<span class="trend-icon up">↗</span>',
            'down': '<span class="trend-icon down">↘</span>',
            'stable': '<span class="trend-icon stable">→</span>'
        };
        return trendIcons[trend] || '';
    }

    // 更新所有界面数据
    updateAllData() {
        this.updatePersonnelInfo();
        this.updateMonitoringData();
        this.updateCircularProgress();
        this.updateEquipmentList();
        this.updateAlertList();
        this.updateDataTable();
        this.updateEquipmentStatus();
        this.updateProductionMonitoring();
        this.updateStatistics();
        
        // 更新图表
        if (this.chartsManager) {
            this.chartsManager.updateAllCharts();
        }
    }

    // 更新设备状态
    updateEquipmentStatus() {
        const equipmentData = this.dataManager.getEquipmentData();
        const statusList = document.querySelector('.equipment-status .status-list');
        
        if (statusList && equipmentData) {
            statusList.innerHTML = '';
            
            equipmentData.slice(0, 8).forEach(equipment => {
                const statusItem = document.createElement('div');
                statusItem.className = 'status-item';
                statusItem.innerHTML = `
                    <div class="status-indicator ${equipment.status}"></div>
                    <div class="equipment-info">
                        <div class="equipment-name">${equipment.name}</div>
                        <div class="equipment-type">${equipment.type}</div>
                    </div>
                    <div class="equipment-value">${equipment.efficiency}%</div>
                `;
                statusList.appendChild(statusItem);
            });
        }
    }

    // 更新产量监控
    updateProductionMonitoring() {
        const productionData = this.dataManager.getProductionData();
        
        // 更新产量数值
        const dailyOutput = document.querySelector('.production-value[data-type="daily"]');
        const monthlyOutput = document.querySelector('.production-value[data-type="monthly"]');
        const yearlyOutput = document.querySelector('.production-value[data-type="yearly"]');
        
        if (dailyOutput && productionData) {
            dailyOutput.textContent = `${productionData.daily.toLocaleString()}吨`;
        }
        if (monthlyOutput && productionData) {
            monthlyOutput.textContent = `${productionData.monthly.toLocaleString()}吨`;
        }
        if (yearlyOutput && productionData) {
            yearlyOutput.textContent = `${productionData.yearly.toLocaleString()}吨`;
        }

        // 更新产量进度条
        const dailyProgress = document.querySelector('.production-progress[data-type="daily"] .progress-fill');
        const monthlyProgress = document.querySelector('.production-progress[data-type="monthly"] .progress-fill');
        
        if (dailyProgress && productionData) {
            const dailyPercent = (productionData.daily / productionData.dailyTarget) * 100;
            dailyProgress.style.width = `${Math.min(dailyPercent, 100)}%`;
        }
        if (monthlyProgress && productionData) {
            const monthlyPercent = (productionData.monthly / productionData.monthlyTarget) * 100;
            monthlyProgress.style.width = `${Math.min(monthlyPercent, 100)}%`;
        }
     }

     // 更新统计数据
     updateStatistics() {
         const productionData = this.dataManager.getProductionData();
         const equipmentData = this.dataManager.getEquipmentData();
         
         // 更新生产统计
         const totalOutput = document.querySelector('.stat-value[data-stat="output"]');
         const totalEquipment = document.querySelector('.stat-value[data-stat="equipment"]');
         const efficiency = document.querySelector('.stat-value[data-stat="efficiency"]');
         const alerts = document.querySelector('.stat-value[data-stat="alerts"]');
         
         if (totalOutput && productionData) {
             totalOutput.textContent = `${productionData.daily}吨`;
         }
         
         if (totalEquipment && equipmentData) {
             totalEquipment.textContent = `${equipmentData.length}台`;
         }
         
         if (efficiency && equipmentData) {
             const avgEfficiency = equipmentData.reduce((sum, eq) => sum + eq.efficiency, 0) / equipmentData.length;
             efficiency.textContent = `${Math.round(avgEfficiency)}%`;
         }
         
         if (alerts) {
             const alertCount = equipmentData.filter(eq => eq.status === 'warning').length;
             alerts.textContent = `${alertCount}个`;
         }
     }

     // 初始化工具提示
    initializeTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            });
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip();
            });
        });
    }

    // 显示工具提示
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '0.5rem';
        tooltip.style.borderRadius = '5px';
        tooltip.style.fontSize = '0.8rem';
        tooltip.style.zIndex = '10000';
        tooltip.style.pointerEvents = 'none';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    }

    // 隐藏工具提示
    hideTooltip() {
        const tooltip = document.querySelector('.tooltip-popup');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // 初始化动画
    initializeAnimations() {
        // 为卡片添加悬停动画
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // 设置数据更新监听器
    setupDataUpdateListener() {
        document.addEventListener('dataUpdated', (event) => {
            this.handleDataUpdate(event.detail);
        });
    }

    // 处理数据更新
    handleDataUpdate(updateData) {
        if (this.currentSection === 'dashboard') {
            this.updateDashboardData();
        } else if (this.currentSection === 'monitoring') {
            this.updateMonitoringData();
        } else if (this.currentSection === 'equipment') {
            this.updateEquipmentData();
        } else if (this.currentSection === 'safety') {
            this.updateSafetyData();
        }
        
        // 更新报警通知
        this.updateAlertNotifications();
    }

    // 更新仪表板数据
    updateDashboardData() {
        if (!this.dataManager) return;
        
        const overviewData = this.dataManager.getData('overview');
        const alertsData = this.dataManager.getData('alerts');
        const safetyData = this.dataManager.getData('safety');
        
        // 更新概览统计
        this.updateOverviewStats(overviewData);
        
        // 更新最近报警
        this.loadRecentAlerts(alertsData);
        
        // 更新安全状态
        this.updateSafetyStatus(safetyData);
        
        // 更新生产图表
        if (this.chartsManager) {
            this.chartsManager.updateProductionChart();
        }
    }

    // 更新监控数据
    updateMonitoringData() {
        if (window.MonitoringManager) {
            window.MonitoringManager.updateSensorData();
        }
    }

    // 更新设备数据
    updateEquipmentData() {
        this.updateEquipmentStatus();
    }

    // 更新安全数据
    updateSafetyData() {
        this.updateAlertStats();
    }

    // 更新报表数据
    updateReportsData() {
        if (this.chartsManager) {
            this.chartsManager.initReportChart();
        }
    }

    // 更新报警通知
    updateAlertNotifications() {
        this.loadRecentAlerts();
    }

    // 加载初始数据
    loadInitialData() {
        // 使用数据管理器的数据
        if (this.dataManager) {
            this.updateDashboardData();
            this.updateMonitoringData();
            this.updateEquipmentData();
            this.updateSafetyData();
            this.updateReportsData();
            this.updateAlertNotifications();
        }
    }

    // 更新概览统计
    updateOverviewStats() {
        const stats = {
            onlineDevices: Math.floor(Math.random() * 50) + 150,
            normalRate: (Math.random() * 2 + 97).toFixed(1),
            dailyProduction: Math.floor(Math.random() * 500) + 2000,
            onlinePersonnel: Math.floor(Math.random() * 10) + 10
        };

        // 更新DOM元素
        const statElements = document.querySelectorAll('.stat-value');
        if (statElements.length >= 4) {
            statElements[0].textContent = stats.onlineDevices;
            statElements[1].textContent = stats.normalRate + '%';
            statElements[2].textContent = stats.dailyProduction.toLocaleString();
            statElements[3].textContent = stats.onlinePersonnel;
        }
    }

    // 加载最新警报
    loadRecentAlerts() {
        const alerts = [
            { time: '10:30', message: '挖掘机#3温度异常', type: 'warning' },
            { time: '09:15', message: '新设备上线', type: 'info' },
            { time: '08:45', message: '系统自检完成', type: 'safe' }
        ];

        const alertList = document.querySelector('.alert-list');
        if (alertList) {
            alertList.innerHTML = alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                    <span class="alert-time">${alert.time}</span>
                    <span class="alert-message">${alert.message}</span>
                </div>
            `).join('');
        }
    }

    // 更新安全状态
    updateSafetyStatus() {
        const safetyIndicators = document.querySelectorAll('.indicator');
        safetyIndicators.forEach((indicator, index) => {
            const statuses = ['safe', 'safe', 'warning'];
            indicator.className = `indicator ${statuses[index]}`;
        });
    }

    // 加载设备数据
    loadEquipmentData() {
        // 模拟设备数据加载
        console.log('加载设备数据...');
        
        // 更新设备状态
        setTimeout(() => {
            this.updateEquipmentStatus();
        }, 500);
    }

    // 更新设备状态
    updateEquipmentStatus() {
        const equipmentItems = document.querySelectorAll('.equipment-item');
        equipmentItems.forEach(item => {
            const statuses = ['online', 'online', 'warning'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            item.className = `equipment-item ${randomStatus}`;
        });
    }

    // 加载安全数据
    loadSafetyData() {
        console.log('加载安全数据...');
        this.updateAlertStats();
    }

    // 更新警报统计
    updateAlertStats() {
        const alertStats = {
            critical: Math.floor(Math.random() * 5),
            warning: Math.floor(Math.random() * 10) + 3,
            info: Math.floor(Math.random() * 20) + 10
        };

        const statElements = document.querySelectorAll('.alert-stat .count');
        if (statElements.length >= 3) {
            statElements[0].textContent = alertStats.critical;
            statElements[1].textContent = alertStats.warning;
            statElements[2].textContent = alertStats.info;
        }
    }

    // 设置报表筛选器
    setupReportFilters() {
        const generateBtn = document.getElementById('generateReport');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // 设置默认日期
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) {
            startDateInput.value = startDate.toISOString().split('T')[0];
        }
        if (endDateInput) {
            endDateInput.value = today.toISOString().split('T')[0];
        }
    }

    // 生成报表
    generateReport() {
        const reportType = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        console.log(`生成报表: ${reportType}, 时间范围: ${startDate} 到 ${endDate}`);
        
        // 显示加载状态
        this.showLoading('正在生成报表...');
        
        // 模拟报表生成
        setTimeout(() => {
            this.hideLoading();
            this.updateReportSummary(reportType);
            if (window.ChartsManager) {
                window.ChartsManager.updateReportChart(reportType);
            }
        }, 2000);
    }

    // 显示加载状态
    showLoading(message = '加载中...') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading"></div>
                <p>${message}</p>
            </div>
        `;
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            text-align: center;
        `;
        document.body.appendChild(loading);
    }

    // 隐藏加载状态
    hideLoading() {
        const loading = document.querySelector('.loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    // 更新报表摘要
    updateReportSummary(reportType) {
        const summaryData = {
            production: {
                totalProduction: '72,450 吨',
                averageEfficiency: '87.3%',
                safetyIncidents: '3 起',
                equipmentFailures: '12 次'
            },
            safety: {
                totalProduction: '安全检查',
                averageEfficiency: '95.2%',
                safetyIncidents: '2 起',
                equipmentFailures: '风险评估'
            },
            equipment: {
                totalProduction: '设备维护',
                averageEfficiency: '92.1%',
                safetyIncidents: '故障分析',
                equipmentFailures: '8 次'
            }
        };

        const data = summaryData[reportType] || summaryData.production;
        const summaryItems = document.querySelectorAll('.summary-value');
        
        if (summaryItems.length >= 4) {
            summaryItems[0].textContent = data.totalProduction;
            summaryItems[1].textContent = data.averageEfficiency;
            summaryItems[2].textContent = data.safetyIncidents;
            summaryItems[3].textContent = data.equipmentFailures;
        }
    }

    // 开始实时更新
    startRealTimeUpdates() {
        // 每30秒更新一次数据
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.updateRealTimeData();
            }
        }, 30000);

        // 每5秒更新一次时间戳
        setInterval(() => {
            this.updateTimestamps();
        }, 5000);
    }

    // 更新实时数据
    updateRealTimeData() {
        if (this.currentSection === 'dashboard') {
            this.updateOverviewStats();
        } else if (this.currentSection === 'monitoring') {
            if (window.MonitoringManager) {
                window.MonitoringManager.updateSensorData();
            }
        }
    }

    // 更新时间戳
    updateTimestamps() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });

        // 更新警报时间（示例）
        const alertTimes = document.querySelectorAll('.alert-time');
        if (alertTimes.length > 0) {
            alertTimes[0].textContent = timeString;
        }
    }

    // 处理窗口大小改变
    handleResize() {
        // 重新调整图表大小
        if (window.ChartsManager) {
            window.ChartsManager.resizeCharts();
        }

        // 重新调整地图大小
        if (window.amapIntegration && window.amapIntegration.map) {
            window.amapIntegration.map.getSize();
        }
    }

    // 处理键盘快捷键
    async handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + 数字键切换部分
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            const sections = ['dashboard', 'monitoring', 'equipment', 'safety', 'reports'];
            const index = parseInt(e.key) - 1;
            if (sections[index]) {
                await this.switchSection(sections[index]);
            }
        }

        // ESC键关闭模态框或全屏
        if (e.key === 'Escape') {
            this.handleEscape();
        }
    }

    // 处理ESC键
    handleEscape() {
        // 关闭全屏查看器
        const fullscreenViewer = document.querySelector('.viewer-container.fullscreen');
        if (fullscreenViewer) {
            fullscreenViewer.classList.remove('fullscreen');
        }

        // 关闭加载覆盖层
        this.hideLoading();
    }

    // 处理页面可见性变化
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            console.log('页面变为可见，恢复实时更新');
            this.updateRealTimeData();
        } else {
            console.log('页面变为隐藏，暂停部分更新');
        }
    }

    // 获取当前部分
    getCurrentSection() {
        return this.currentSection;
    }

    // 检查是否已初始化
    isReady() {
        return this.isInitialized;
    }

    // 初始化全屏按钮
    initializeFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });

            // 监听全屏状态变化
            document.addEventListener('fullscreenchange', () => {
                this.updateFullscreenIcon();
            });
            document.addEventListener('webkitfullscreenchange', () => {
                this.updateFullscreenIcon();
            });
            document.addEventListener('mozfullscreenchange', () => {
                this.updateFullscreenIcon();
            });
            document.addEventListener('MSFullscreenChange', () => {
                this.updateFullscreenIcon();
            });
        }
    }

    // 切换全屏状态
    toggleFullscreen() {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
            // 进入全屏
            this.enterFullscreen();
        } else {
            // 退出全屏
            this.exitFullscreen();
        }
    }

    // 初始化地图缩放控制按钮
    initializeZoomControls() {
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');

        console.log('🔍 查找缩放按钮元素...');
        console.log('放大按钮:', zoomInBtn ? '✅ 找到' : '❌ 未找到');
        console.log('缩小按钮:', zoomOutBtn ? '✅ 找到' : '❌ 未找到');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                console.log('🖱️ 放大按钮被点击');
                this.zoomInMap();
            });
            console.log('✅ 放大按钮事件监听器已绑定');
        } else {
            console.error('❌ 未找到放大按钮元素 #zoom-in-btn');
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                console.log('🖱️ 缩小按钮被点击');
                this.zoomOutMap();
            });
            console.log('✅ 缩小按钮事件监听器已绑定');
        } else {
            console.error('❌ 未找到缩小按钮元素 #zoom-out-btn');
        }

        console.log('🎯 地图缩放控制按钮初始化完成');
    }

    // 地图放大功能
    zoomInMap() {
        console.log('🔍 地图放大');
        
        // 检查地图是否已初始化
        if (window.amapIntegration?.map) {
            // 使用高德地图的缩放功能
            window.amapIntegration.map.zoomIn();
            
            // 检查是否为卫星地图模式
            const isSatelliteMode = window.amapIntegration.isSatelliteOn;
            if (isSatelliteMode) {
                console.log('✅ 卫星地图已放大');
            } else {
                console.log('✅ 标准地图已放大');
            }
        } else {
            console.log('⚠️ 地图未初始化，请先切换到包含地图的页面');
        }
    }

    // 地图缩小功能
    zoomOutMap() {
        console.log('🔍 地图缩小');
        
        // 检查地图是否已初始化
        if (window.amapIntegration?.map) {
            // 使用高德地图的缩放功能
            window.amapIntegration.map.zoomOut();
            
            // 检查是否为卫星地图模式
            const isSatelliteMode = window.amapIntegration.isSatelliteOn;
            if (isSatelliteMode) {
                console.log('✅ 卫星地图已缩小');
            } else {
                console.log('✅ 标准地图已缩小');
            }
        } else {
            console.log('⚠️ 地图未初始化，请先切换到包含地图的页面');
        }
    }

    // 进入全屏
    enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 退出全屏
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // 更新全屏图标
    updateFullscreenIcon() {
        const fullscreenIcon = document.querySelector('.fullscreen-icon');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        if (fullscreenIcon && fullscreenBtn) {
            const isFullscreen = document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.mozFullScreenElement || 
                                document.msFullscreenElement;
            
            if (isFullscreen) {
                fullscreenIcon.textContent = '⛶'; // 退出全屏图标
                fullscreenBtn.title = '退出全屏';
            } else {
                fullscreenIcon.textContent = '⛶'; // 进入全屏图标
                fullscreenBtn.title = '全屏';
            }
        }
    }
}

// 页面加载完成后初始化应用程序
document.addEventListener('DOMContentLoaded', async () => {
    window.MiningPlatform = new MiningPlatform();
    await window.MiningPlatform.init();
});

// 处理浏览器后退/前进
window.addEventListener('popstate', async (e) => {
    if (e.state && e.state.section && window.MiningPlatform) {
        await window.MiningPlatform.switchSection(e.state.section);
    }
});

// 导出到全局作用域以供其他模块使用
window.MiningPlatform = window.MiningPlatform || null;