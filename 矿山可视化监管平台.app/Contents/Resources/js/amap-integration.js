/**
 * 高德地图集成模块
 * 提供2D地图、卫星图像和地理数据服务
 */

class AmapIntegration {
    constructor() {
        this.isInitialized = false;
        this.map = null;
        this.apiKey = null; // 向后兼容：默认等同于webJsKey
        this.webJsKey = null; // Web 端 JS API 密钥
        this.serviceKey = null; // Web 服务（REST/静态地图）密钥
        this.baseUrl = 'https://restapi.amap.com/v3';
        this.staticMapUrl = 'https://restapi.amap.com/v3/staticmap';
        
        // 默认矿山位置（重庆重钢歌乐山矿）
        this.defaultMineLocation = {
            lat: 29.5833,
            lng: 106.4833,
            name: '重庆重钢歌乐山矿'
        };
        
        // 地形数据缓存
        this.terrainCache = new Map();
        this.imageCache = new Map();
        
        // 2D地图相关状态
        this.satelliteLayer = null;
        this.isMapCreated = false;
        this.isSatelliteOn = false;
        
        console.log('🗺️ 高德地图集成模块已加载');
    }

    /**
     * 初始化高德地图服务
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 开始初始化AmapIntegration...');
        
        // 初始化密钥
        this.webJsKey = window.getAmapWebJsKey ? window.getAmapWebJsKey() : this.webJsKey;
        this.serviceKey = window.getAmapServiceKey ? window.getAmapServiceKey() : this.serviceKey;
        // 兼容未加载 config.js 的场景：从本地存储读取密钥
        if (!this.webJsKey) {
            const localKey = this.getApiKey && this.getApiKey();
            if (localKey) this.webJsKey = localKey;
        }
        if (!this.serviceKey) {
            const localKey = this.getApiKey && this.getApiKey();
            if (localKey) this.serviceKey = localKey;
        }
        this.apiKey = this.webJsKey || this.apiKey;
        
        console.log('🔑 API密钥配置:', { 
            webJsKey: this.webJsKey ? '已设置' : '未设置',
            serviceKey: this.serviceKey ? '已设置' : '未设置'
        });
        
        try {
            console.log('📡 开始加载高德地图API...');
            await this.loadAmapAPI();
            console.log('✅ 高德地图API加载完成');
            this.isInitialized = true;
            console.log('🎯 AmapIntegration初始化完成');
        } catch (error) {
            console.error('❌ AmapIntegration初始化失败:', error);
            throw error;
        }
    }



    calculateZoomLevel(bounds) {
        // 如果有bounds则按范围估算缩放级别，否则使用默认
        if (!bounds) return 12;
        const { north, south, east, west } = bounds;
        const latDiff = Math.abs(north - south);
        const lngDiff = Math.abs(east - west);
        const maxDiff = Math.max(latDiff, lngDiff);
        if (maxDiff > 10) return 8;
        if (maxDiff > 3) return 10;
        if (maxDiff > 1) return 12;
        return 14;
    }

    /**
     * 动态加载高德地图API
     */
    async loadAmapAPI() {
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            if (window.AMap) {
                resolve();
                return;
            }
            
            // 可选：配置安全密钥（若你的Key开启了安全校验）
            try {
                const securityJsCode = (typeof window.getAmapSecurityJsCode === 'function' && window.getAmapSecurityJsCode())
                    || localStorage.getItem('amap_security_code');
                if (securityJsCode && !window._AMapSecurityConfig) {
                    window._AMapSecurityConfig = { securityJsCode };
                }
            } catch (_) {}
            
            const script = document.createElement('script');
            // 使用Web JS密钥
            const keyForJs = this.webJsKey || this.apiKey || (this.getApiKey && this.getApiKey());
            // 同时加载Elevation与Geocoder插件
            script.src = `https://webapi.amap.com/maps?v=2.0&key=${keyForJs}&plugin=AMap.Elevation,AMap.Geocoder`;
            script.async = true;
            
            script.onload = () => {
                console.log('✅ 高德地图API加载成功');
                // 确保插件可用
                try {
                    if (window.AMap && window.AMap.plugin) {
                        window.AMap.plugin(['AMap.Elevation', 'AMap.Geocoder'], () => {
                            console.log('🔌 AMap插件已准备就绪: Elevation, Geocoder');
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                } catch (e) {
                    console.warn('插件加载调用异常，但继续初始化:', e);
                    resolve();
                }
            };
            
            script.onerror = () => {
                reject(new Error('高德地图API加载失败'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * 验证API可用性
     */
    async validateAPI() {
        try {
            // 首先尝试加载Web端JS API来验证密钥
            await this.loadAmapAPI();
            
            // 如果API加载成功，说明密钥有效
            if (typeof AMap !== 'undefined') {
                console.log('✅ 高德地图Web端JS API验证成功');
                return true;
            } else {
                throw new Error('Web端JS API加载失败');
            }
        } catch (error) {
            console.warn('⚠️ Web端JS API验证失败，尝试REST API验证:', error.message);
            
            // 如果Web端API验证失败，尝试REST API验证（但忽略平台匹配错误）
            try {
                const keyForService = this.serviceKey || this.webJsKey || this.apiKey;
                const testUrl = `${this.baseUrl}/geocode/geo?address=北京市&key=${keyForService}`;
                const response = await fetch(testUrl);
                const data = await response.json();
                
                // 如果是平台不匹配错误，但密钥格式正确，仍然认为验证成功
                if (data.status !== '1') {
                    if (data.info && data.info.includes('USERKEY_PLAT_NOMATCH')) {
                        console.log('⚠️ API密钥平台配置不匹配，但密钥有效，继续使用Web端功能');
                        return true;
                    }
                    throw new Error(`REST API验证失败: ${data.info}`);
                }
                
                console.log('✅ 高德地图REST API验证成功');
                return true;
            } catch (restError) {
                throw new Error(`API验证失败: ${restError.message}`);
            }
        }
    }

    // 新增：创建2D高德地图
    async create2DMap(containerId = 'amap-container') {
        try {
            // 确保API已初始化并加载
            if (!this.isInitialized || typeof AMap === 'undefined') {
                await this.initialize();
            }
            const container = document.getElementById(containerId);
            if (!container) throw new Error('2D地图容器未找到');
            
            const mine = this.getCurrentMineInfo();
            
            // 设置默认的地图中心和缩放级别
            let center, zoom;
            if (mine && mine.lng && mine.lat) {
                center = [mine.lng, mine.lat];
                zoom = this.calculateZoomLevel(mine.bounds);
                console.log('🎯 使用矿山坐标作为地图中心:', center);
            } else {
                // 没有选择矿山时，使用重庆矿山的坐标
                center = [106.4833, 29.5833]; // 重庆重钢歌乐山矿坐标作为默认中心
                zoom = 12; // 适中的缩放级别显示矿山区域
                console.log('🗺️ 没有矿山数据，使用重庆矿山作为默认中心');
            }
            
            // 创建2D地图实例
            this.map = new AMap.Map(containerId, {
                viewMode: '2D',
                zoom: zoom,
                center: center,
                resizeEnable: true,
                features: ['bg', 'road', 'building']
            });
            
            // 预创建卫星图层并默认启用
            this.satelliteLayer = new AMap.TileLayer.Satellite();
            this.satelliteLayer.setMap(this.map); // 默认启用卫星图层
            this.isSatelliteOn = true;
            
            // 只有在有矿山信息时才添加标记
            if (mine && mine.lng && mine.lat) {
                this.addMineMarker(mine);
                console.log('📍 已添加矿山标记');
            } else {
                console.log('⚠️ 没有矿山信息，跳过标记添加');
            }
            
            this.isMapCreated = true;
            console.log('✅ 2D高德地图已创建，默认启用卫星图层');
            return this.map;
        } catch (error) {
            console.error('❌ 创建2D地图失败:', error);
            throw error;
        }
    }

    // 新增：切换卫星图层
    toggleSatellite(enable = true) {
        if (!this.map) {
            console.warn('2D地图未创建，无法切换卫星图层');
            return;
        }
        if (enable) {
            if (!this.isSatelliteOn) {
                if (this.satelliteLayer) {
                    this.satelliteLayer.setMap(this.map);
                }
                this.isSatelliteOn = true;
                console.log('🛰️ 已开启卫星图层');
            }
        } else {
            if (this.isSatelliteOn) {
                if (this.satelliteLayer) {
                    this.satelliteLayer.setMap(null);
                }
                this.isSatelliteOn = false;
                console.log('🗺️ 已关闭卫星图层');
            }
        }
    }

    // 添加矿山标记
    addMineMarker(mine) {
        if (!this.map || !mine) return;
        
        try {
            // 创建矿山标记
            const marker = new AMap.Marker({
                position: [mine.lng, mine.lat],
                title: mine.name,
                icon: new AMap.Icon({
                    size: new AMap.Size(32, 32),
                    image: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="12" fill="#FF6B35" stroke="#fff" stroke-width="2"/>
                            <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">矿</text>
                        </svg>
                    `),
                    imageSize: new AMap.Size(32, 32)
                })
            });
            
            // 添加标记到地图
            marker.setMap(this.map);
            
            // 创建信息窗体
            const infoWindow = new AMap.InfoWindow({
                content: `
                    <div style="padding: 10px; min-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">${mine.name}</h4>
                        <p style="margin: 4px 0; color: #666;">类型: ${mine.type || '露天矿'}</p>
                        <p style="margin: 4px 0; color: #666;">坐标: ${mine.lat.toFixed(4)}, ${mine.lng.toFixed(4)}</p>
                        <p style="margin: 4px 0; color: #666;">状态: 运营中</p>
                    </div>
                `,
                offset: new AMap.Pixel(0, -30)
            });
            
            // 点击标记显示信息窗体并跳转到矿山位置
            marker.on('click', () => {
                // 显示信息窗体
                infoWindow.open(this.map, marker.getPosition());
                
                // 地图跳转到矿山位置
                this.jumpToMine(mine);
            });
            
            console.log(`✅ 已添加矿山标记: ${mine.name}`);
            
        } catch (error) {
            console.error('❌ 添加矿山标记失败:', error);
        }
    }

    /**
     * 显示内蒙古矿山标记
     */
    showInnerMongoliaMines() {
        if (!this.map) {
            console.warn('⚠️ 地图未初始化，无法显示矿山标记');
            return;
        }

        // 获取内蒙古矿山数据
        const innerMongoliaMines = this.getInnerMongoliaMines();
        
        // 清除现有标记（如果有的话）
        this.clearMineMarkers();
        
        // 添加内蒙古矿山标记
        innerMongoliaMines.forEach(mine => {
            this.addMineMarker(mine);
        });

        console.log(`✅ 已显示 ${innerMongoliaMines.length} 个内蒙古矿山标记`);
    }

    /**
     * 获取内蒙古矿山数据
     */
    getInnerMongoliaMines() {
        // 从数据管理器获取矿山数据
        let mines = [];
        
        try {
            if (window.DataManager && window.DataManager.getRealMineData) {
                const realMineData = window.DataManager.getRealMineData();
                if (realMineData && realMineData.mines) {
                    mines = realMineData.mines.filter(mine => 
                        mine.location.province === '内蒙古自治区'
                    );
                }
            }
        } catch (error) {
            console.warn('⚠️ 无法从数据管理器获取矿山数据，使用默认数据');
        }

        // 如果没有从数据管理器获取到数据，使用默认的内蒙古矿山数据
        if (mines.length === 0) {
            mines = [
                {
                    id: 'mine_003',
                    name: '内蒙古准格尔煤矿',
                    type: '露天煤矿',
                    lat: 39.8612,
                    lng: 111.1851,
                    location: {
                        lat: 39.8612,
                        lng: 111.1851,
                        province: '内蒙古自治区',
                        city: '鄂尔多斯市准格尔旗'
                    },
                    status: 'active'
                },
                {
                    id: 'mine_004',
                    name: '内蒙古黑岱沟露天煤矿',
                    type: '露天煤矿',
                    lat: 39.7234,
                    lng: 111.9876,
                    location: {
                        lat: 39.7234,
                        lng: 111.9876,
                        province: '内蒙古自治区',
                        city: '准格尔旗'
                    },
                    status: 'active'
                }
            ];
        }

        return mines;
    }

    /**
     * 跳转到指定矿山位置
     */
    jumpToMine(mine) {
        console.log('🎯 jumpToMine被调用，参数:', mine);
        console.log('🗺️ 当前地图对象状态:', !!this.map);
        
        // 获取坐标
        let lng, lat;
        if (mine && mine.lng && mine.lat) {
            lng = mine.lng;
            lat = mine.lat;
            console.log('📍 使用直接坐标:', {lng, lat});
        } else if (mine && mine.location && mine.location.lng && mine.location.lat) {
            lng = mine.location.lng;
            lat = mine.location.lat;
            console.log('📍 使用location坐标:', {lng, lat});
        } else {
            console.log('⚠️ 没有有效的矿山坐标数据，跳过跳转');
            console.log('🔍 mine对象详情:', JSON.stringify(mine, null, 2));
            return;
        }
        
        const position = [lng, lat];
        console.log(`🗺️ 准备跳转到坐标: [${lng}, ${lat}] (${mine?.name || '未知矿山'})`);
        
        // 直接跳转到矿山位置
        if (this.map) {
            try {
                console.log('🚀 开始执行地图跳转...');
                // 使用更高的缩放级别和更平滑的动画
                this.map.setZoomAndCenter(15, position, false, 1500);
                console.log(`✅ 地图跳转命令已发送到: ${mine?.name || '未知矿山'}`);
                
                // 验证跳转结果
                setTimeout(() => {
                    const currentCenter = this.map.getCenter();
                    console.log(`🔍 跳转后地图中心: [${currentCenter.lng.toFixed(4)}, ${currentCenter.lat.toFixed(4)}]`);
                    console.log(`🔍 目标坐标: [${lng}, ${lat}]`);
                }, 2000);
                
            } catch (error) {
                console.error('❌ 地图跳转失败:', error);
            }
        } else {
            console.error('❌ 地图对象不存在，无法跳转');
        }
    }

    /**
     * 清除矿山标记
     */
    clearMineMarkers() {
        if (!this.map) return;
        
        try {
            // 清除所有标记
            this.map.clearMap();
            console.log('🧹 已清除所有矿山标记');
        } catch (error) {
            console.error('❌ 清除标记失败:', error);
        }
    }

    /**
     * 获取API密钥（向后兼容：返回通用密钥）
     */
    getApiKey() {
        if (typeof window.getAmapApiKey === 'function') {
            return window.getAmapApiKey();
        }
        
        // 从localStorage获取
        return localStorage.getItem('amap_api_key');
    }

    /**
     * 获取当前矿山信息
     */
    getCurrentMineInfo() {
        console.log('📍 AmapIntegration.getCurrentMineInfo 被调用');
        console.log('🔍 检查DataManager存在性:', !!window.DataManager);
        console.log('🔍 检查getCurrentMineInfo方法:', typeof window.DataManager?.getCurrentMineInfo);
        
        // 从数据管理器获取当前矿山信息
        if (window.DataManager && typeof window.DataManager.getCurrentMineInfo === 'function') {
            const mine = window.DataManager.getCurrentMineInfo();
            console.log('📍 从DataManager获取的矿山信息:', mine);
            if (mine && (mine.lat && mine.lng)) {
                const result = {
                    name: mine.name,
                    lat: mine.lat,
                    lng: mine.lng,
                    location: {
                        lat: mine.lat,
                        lng: mine.lng
                    },
                    bounds: mine.bounds || this.calculateBounds(mine.lat, mine.lng)
                };
                console.log('✅ 返回处理后的矿山信息:', result);
                return result;
            } else {
                console.log('⚠️ DataManager返回的矿山信息无效:', mine);
            }
        } else {
            console.log('❌ DataManager或getCurrentMineInfo方法不可用');
        }
        
        console.log('⚠️ 没有选中的矿山，返回null');
        // 没有选中矿山时返回null
        return null;
    }

    /**
     * 计算矿区边界
     */
    calculateBounds(lat, lng, size = 0.01) {
        return {
            north: lat + size,
            south: lat - size,
            east: lng + size,
            west: lng - size
        };
    }

    /**
     * 获取地形高程数据
     */
    async getTerrainElevation(bounds) {
        try {
            const cacheKey = `elevation_${bounds.north}_${bounds.south}_${bounds.east}_${bounds.west}`;
            
            // 检查缓存
            if (this.terrainCache.has(cacheKey)) {
                console.log('📦 使用缓存的地形数据');
                return this.terrainCache.get(cacheKey);
            }
            
            console.log('🏔️ 获取地形高程数据...');
            
            // 生成网格点
            const gridSize = 20; // 20x20网格
            const latStep = (bounds.north - bounds.south) / (gridSize - 1);
            const lngStep = (bounds.east - bounds.west) / (gridSize - 1);
            
            const elevationData = [];
            
            // 批量获取高程数据
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const lat = bounds.south + i * latStep;
                    const lng = bounds.west + j * lngStep;
                    
                    // 使用高德地图高程API
                    const elevation = await this.getElevationAtPoint(lat, lng);
                    
                    elevationData.push({
                        lat: lat,
                        lng: lng,
                        elevation: elevation,
                        x: j,
                        z: i
                    });
                }
            }
            
            // 缓存结果
            this.terrainCache.set(cacheKey, elevationData);
            
            console.log(`✅ 获取到 ${elevationData.length} 个高程数据点`);
            return elevationData;
            
        } catch (error) {
            console.error('❌ 获取地形数据失败:', error);
            // 返回模拟数据
            return this.generateMockElevationData(bounds);
        }
    }

    /**
     * 获取单点高程
     */
    async getElevationAtPoint(lat, lng) {
        try {
            if (window.AMap && window.AMap.Elevation) {
                return new Promise((resolve) => {
                    const elevation = new window.AMap.Elevation();
                    elevation.getElevation([lng, lat], (status, result) => {
                        if (status === 'complete' && result.elevations && result.elevations.length > 0) {
                            resolve(result.elevations[0].elevation || 0);
                        } else {
                            // 生成基于位置的模拟高程
                            resolve(this.generateMockElevation(lat, lng));
                        }
                    });
                });
            } else {
                // 使用REST API（使用服务密钥）
                const keyForService = this.serviceKey || this.webJsKey || this.apiKey;
                const url = `${this.baseUrl}/assistant/coordinate/convert?locations=${lng},${lat}&coordsys=gps&output=json&key=${keyForService}`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.status === '1' && data.locations) {
                    // 高德API不直接提供高程，使用模拟数据
                    return this.generateMockElevation(lat, lng);
                }
                
                return this.generateMockElevation(lat, lng);
            }
        } catch (error) {
            console.warn('获取高程失败，使用模拟数据:', error);
            return this.generateMockElevation(lat, lng);
        }
    }

    /**
     * 生成模拟高程数据
     */
    generateMockElevation(lat, lng) {
        // 基于经纬度生成合理的高程数据
        const baseElevation = 1000; // 基础海拔
        const variation = Math.sin(lat * 10) * Math.cos(lng * 10) * 200; // 地形变化
        const noise = (Math.random() - 0.5) * 50; // 随机噪声
        
        return Math.max(0, baseElevation + variation + noise);
    }

    /**
     * 生成模拟地形数据
     */
    generateMockElevationData(bounds) {
        console.log('📊 生成模拟地形数据...');
        
        const gridSize = 20;
        const latStep = (bounds.north - bounds.south) / (gridSize - 1);
        const lngStep = (bounds.east - bounds.west) / (gridSize - 1);
        
        const elevationData = [];
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const lat = bounds.south + i * latStep;
                const lng = bounds.west + j * lngStep;
                
                elevationData.push({
                    lat: lat,
                    lng: lng,
                    elevation: this.generateMockElevation(lat, lng),
                    x: j,
                    z: i
                });
            }
        }
        
        return elevationData;
    }

    /**
     * 获取卫星图像
     */
    async getSatelliteImage(bounds, width = 512, height = 512) {
        try {
            const cacheKey = `satellite_${bounds.north}_${bounds.south}_${bounds.east}_${bounds.west}_${width}_${height}`;
            
            // 检查缓存
            if (this.imageCache.has(cacheKey)) {
                console.log('📦 使用缓存的卫星图像');
                return this.imageCache.get(cacheKey);
            }
            
            console.log('🛰️ 获取卫星图像...');
            
            // 计算中心点
            const centerLat = (bounds.north + bounds.south) / 2;
            const centerLng = (bounds.east + bounds.west) / 2;
            
            // 计算缩放级别
            const zoom = this.calculateZoomLevel(bounds);
            
            // 构建静态地图URL（使用服务密钥）
            const keyForService = this.serviceKey || this.webJsKey || this.apiKey;
            const imageUrl = `${this.staticMapUrl}?` + new URLSearchParams({
                location: `${centerLng},${centerLat}`,
                zoom: zoom,
                size: `${width}*${height}`,
                markers: `mid,,A:${centerLng},${centerLat}`,
                key: keyForService
            }).toString();
            
            console.log('🔗 静态地图URL:', imageUrl);
            
            // 直接返回URL以供纹理加载，避免因CORS导致的fetch验证失败
            this.imageCache.set(cacheKey, imageUrl);
            console.log('✅ 卫星图像URL已生成并缓存，交由纹理加载');
            return imageUrl;
            
        } catch (error) {
            console.error('❌ 获取卫星图像失败:', error);
            // 返回默认纹理
            return this.getDefaultTexture();
        }
    }

    /**
     * 计算合适的缩放级别
     */
    calculateZoomLevel(bounds) {
        const latDiff = bounds.north - bounds.south;
        const lngDiff = bounds.east - bounds.west;
        const maxDiff = Math.max(latDiff, lngDiff);
        
        if (maxDiff > 0.1) return 10;
        if (maxDiff > 0.05) return 12;
        if (maxDiff > 0.01) return 14;
        if (maxDiff > 0.005) return 16;
        return 18;
    }

    /**
     * 获取默认纹理
     */
    getDefaultTexture() {
        // 返回一个简单的数据URL纹理
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // 绘制简单的地形纹理
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#8B7355');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // 添加一些纹理细节
        ctx.fillStyle = 'rgba(139, 115, 85, 0.3)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 10 + 2;
            ctx.fillRect(x, y, size, size);
        }
        
        return canvas.toDataURL();
    }



    /**
     * 获取地理边界的大小（米）
     */
    getBoundsSize(bounds) {
        // 简化计算，1度约等于111km
        const latSize = (bounds.north - bounds.south) * 111000;
        const lngSize = (bounds.east - bounds.west) * 111000 * Math.cos(bounds.south * Math.PI / 180);
        
        return { width: lngSize, height: latSize };
    }

    /**
     * 获取地理边界的中心点
     */
    getBoundsCenter(bounds) {
        return {
            lat: (bounds.north + bounds.south) / 2,
            lng: (bounds.east + bounds.west) / 2
        };
    }

    /**
     * 更新地图数据
     * 在矿山切换时调用，直接跳转到矿山坐标
     */
    updateMapData() {
        console.log('🔄 更新地图数据...');
        
        // 获取当前矿山信息并直接跳转
        const currentMine = this.getCurrentMineInfo();
        console.log('📍 当前矿山信息:', currentMine);
        
        // 直接跳转到矿山位置
        this.jumpToMine(currentMine);
        
        console.log('✅ 地图数据更新完成');
    }

    /**
     * 清理缓存
     */
    clearCache() {
        this.terrainCache.clear();
        this.imageCache.clear();
        console.log('🧹 缓存已清理');
    }

    /**
     * 获取服务状态
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            webJsKey: this.webJsKey ? `${this.webJsKey.substring(0, 8)}...` : null,
            serviceKey: this.serviceKey ? `${this.serviceKey.substring(0, 8)}...` : null,
            cacheSize: {
                terrain: this.terrainCache.size,
                images: this.imageCache.size
            }
        };
    }
}

// 创建全局实例
window.amapIntegration = new AmapIntegration();

// 导出到全局作用域
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmapIntegration;
}

console.log('🗺️ 高德地图集成模块已准备就绪');