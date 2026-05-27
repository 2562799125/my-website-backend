// 数据管理器
class DataManager {
    constructor() {
        this.data = {
            overview: {},
            production: {},
            safety: {},
            equipment: {},
            monitoring: {},
            alerts: [],
            realMineData: null,
            satelliteImagery: null,
            digitalTwin: null
        };
        
        this.updateInterval = null;
        this.isRunning = false;
        
        this.init();
    }

    // 初始化数据管理器
    init() {
        this.generateInitialData();
        this.startDataUpdate();
        this.generateRealMineData();
        this.generateSatelliteImagery();
        this.generateDigitalTwinData();
        console.log('数据管理器初始化完成');
    }

    // 生成初始数据
    generateInitialData() {
        this.data.overview = this.generateOverviewData();
        this.data.production = this.generateProductionData();
        this.data.safety = this.generateSafetyData();
        this.data.equipment = this.generateEquipmentData();
        this.data.monitoring = this.generateMonitoringData();
        this.data.alerts = this.generateAlertsData();
        this.data.personnel = this.generatePersonnelData();
        this.data.progress = this.generateProgressData();
        this.data.table = this.generateTableData();
        this.data.productionData = this.generateProductionData();
        this.data.themeContents = this.generateThemeContents();
    }

    // 生成概览数据
    generateOverviewData() {
        return {
            totalProduction: {
                value: 125680,
                unit: '吨',
                change: '+5.2%',
                trend: 'up'
            },
            activeEquipment: {
                value: 45,
                unit: '台',
                change: '+2',
                trend: 'up'
            },
            safetyDays: {
                value: 128,
                unit: '天',
                change: '+1',
                trend: 'up'
            },
            efficiency: {
                value: 87.5,
                unit: '%',
                change: '+1.8%',
                trend: 'up'
            },
            onlinePersonnel: {
                value: 156,
                unit: '人',
                change: '+3',
                trend: 'up'
            },
            energyConsumption: {
                value: 2340,
                unit: 'kWh',
                change: '-2.1%',
                trend: 'down'
            }
        };
    }

    // 生成生产数据
    generateProductionData() {
        const today = new Date();
        const dailyProduction = [];
        const monthlyProduction = [];
        
        // 生成最近30天的日产量数据
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const baseProduction = 2000 + Math.sin(i * 0.2) * 300;
            const randomVariation = (Math.random() - 0.5) * 400;
            const production = Math.max(1500, Math.round(baseProduction + randomVariation));
            
            dailyProduction.push({
                date: date.toISOString().split('T')[0],
                production: production,
                target: 2200,
                efficiency: Math.round((production / 2200) * 100 * 10) / 10
            });
        }

        // 生成最近12个月的月产量数据
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            
            const baseProduction = 65000 + Math.sin(i * 0.5) * 10000;
            const randomVariation = (Math.random() - 0.5) * 8000;
            const production = Math.max(50000, Math.round(baseProduction + randomVariation));
            
            monthlyProduction.push({
                month: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
                production: production,
                target: 70000,
                efficiency: Math.round((production / 70000) * 100 * 10) / 10
            });
        }

        return {
            daily: dailyProduction,
            monthly: monthlyProduction,
            currentShift: {
                shift: '白班',
                startTime: '08:00',
                endTime: '16:00',
                production: 850,
                target: 900,
                progress: 94.4
            },
            realTimeRate: {
                current: 125,
                average: 120,
                unit: '吨/小时'
            }
        };
    }

    // 生成安全数据
    generateSafetyData() {
        return {
            safetyScore: 95.8,
            incidentCount: {
                today: 0,
                thisWeek: 1,
                thisMonth: 3,
                thisYear: 15
            },
            safetyMetrics: {
                consecutiveSafeDays: 128,
                lastIncidentDate: '2024-08-15',
                safetyTrainingCompletion: 98.5,
                emergencyDrillsCompleted: 12
            },
            riskAreas: [
                {
                    area: '采掘区域A',
                    riskLevel: 'medium',
                    riskScore: 65,
                    lastInspection: '2024-12-20',
                    issues: ['通风不足', '照明设备老化']
                },
                {
                    area: '运输通道B',
                    riskLevel: 'low',
                    riskScore: 25,
                    lastInspection: '2024-12-21',
                    issues: []
                },
                {
                    area: '设备维护区',
                    riskLevel: 'high',
                    riskScore: 85,
                    lastInspection: '2024-12-19',
                    issues: ['高压设备未检修', '防护设备缺失', '操作规程不完善']
                }
            ],
            emergencyContacts: [
                { name: '安全主管', phone: '138-0000-0001', role: '安全负责人' },
                { name: '医疗救护', phone: '138-0000-0002', role: '医疗救援' },
                { name: '消防队长', phone: '138-0000-0003', role: '消防救援' }
            ]
        };
    }

    // 生成设备数据
    generateEquipmentData() {
        const equipmentTypes = [
            { type: 'excavator', name: '挖掘机', count: 12 },
            { type: 'truck', name: '运输车', count: 18 },
            { type: 'drill', name: '钻机', count: 8 },
            { type: 'crusher', name: '破碎机', count: 4 },
            { type: 'conveyor', name: '传送带', count: 15 }
        ];

        const equipment = [];
        let equipmentId = 1;

        equipmentTypes.forEach(type => {
            for (let i = 1; i <= type.count; i++) {
                const status = this.getRandomStatus();
                const efficiency = status === 'running' ? 
                    Math.round((80 + Math.random() * 20) * 10) / 10 : 0;
                
                equipment.push({
                    id: `${type.type}-${String(equipmentId).padStart(3, '0')}`,
                    name: `${type.name} ${String(i).padStart(2, '0')}`,
                    type: type.type,
                    status: status,
                    efficiency: efficiency,
                    location: this.getRandomLocation(),
                    lastMaintenance: this.getRandomDate(30),
                    nextMaintenance: this.getRandomDate(-15),
                    workingHours: Math.round(Math.random() * 2000 + 1000),
                    fuelLevel: Math.round(Math.random() * 100),
                    temperature: Math.round((60 + Math.random() * 40) * 10) / 10,
                    vibration: Math.round(Math.random() * 10 * 10) / 10,
                    operator: this.getRandomOperator()
                });
                equipmentId++;
            }
        });

        // 计算统计信息
        const totalCount = equipment.length;
        const runningCount = equipment.filter(e => e.status === 'running').length;
        const maintenanceCount = equipment.filter(e => e.status === 'maintenance').length;
        const idleCount = equipment.filter(e => e.status === 'idle').length;
        const errorCount = equipment.filter(e => e.status === 'error').length;

        return {
            equipment: equipment,
            statistics: {
                total: totalCount,
                running: runningCount,
                maintenance: maintenanceCount,
                idle: idleCount,
                error: errorCount,
                efficiency: Math.round((runningCount / totalCount) * 100 * 10) / 10
            },
            maintenanceSchedule: this.generateMaintenanceSchedule(equipment)
        };
    }

    // 生成监控数据
    generateMonitoringData() {
        const sensors = [];
        const sensorTypes = [
            { type: 'temperature', name: '温度传感器', unit: '°C', min: 15, max: 35 },
            { type: 'humidity', name: '湿度传感器', unit: '%', min: 30, max: 90 },
            { type: 'gas', name: '气体传感器', unit: '%', min: 0, max: 0.1 },
            { type: 'pressure', name: '压力传感器', unit: 'kPa', min: 95, max: 105 },
            { type: 'vibration', name: '振动传感器', unit: 'mm/s', min: 0, max: 20 },
            { type: 'noise', name: '噪音传感器', unit: 'dB', min: 60, max: 90 }
        ];

        const locations = ['采掘区A', '采掘区B', '运输通道', '设备区', '办公区', '入口区'];

        sensorTypes.forEach((sensorType, typeIndex) => {
            locations.forEach((location, locationIndex) => {
                const sensorId = `${sensorType.type}-${typeIndex + 1}${locationIndex + 1}`;
                const value = this.generateSensorValue(sensorType.min, sensorType.max, sensorType.type);
                const status = this.getSensorStatus(value, sensorType);

                sensors.push({
                    id: sensorId,
                    name: `${location}${sensorType.name}`,
                    type: sensorType.type,
                    location: location,
                    value: value,
                    unit: sensorType.unit,
                    status: status,
                    threshold: {
                        min: sensorType.min,
                        max: sensorType.max,
                        warning: sensorType.max * 0.8
                    },
                    lastUpdate: new Date().toISOString(),
                    history: this.generateSensorHistory(sensorType.min, sensorType.max, sensorType.type)
                });
            });
        });

        return {
            sensors: sensors,
            summary: {
                total: sensors.length,
                normal: sensors.filter(s => s.status === 'normal').length,
                warning: sensors.filter(s => s.status === 'warning').length,
                error: sensors.filter(s => s.status === 'error').length,
                offline: sensors.filter(s => s.status === 'offline').length
            },
            environmentalConditions: {
                airQuality: 'good',
                visibility: 'excellent',
                weatherConditions: 'clear',
                windSpeed: '5 km/h',
                atmosphericPressure: '101.3 kPa'
            }
        };
    }

    // 生成报警数据
    generateAlertsData() {
        const alertTypes = [
            { type: 'safety', severity: 'high', message: '设备维护区检测到高风险操作' },
            { type: 'equipment', severity: 'medium', message: '挖掘机-003 温度异常' },
            { type: 'production', severity: 'low', message: '采掘区A产量低于预期' },
            { type: 'environment', severity: 'medium', message: '运输通道气体浓度偏高' },
            { type: 'safety', severity: 'high', message: '紧急停机按钮被触发' },
            { type: 'equipment', severity: 'low', message: '传送带-005 需要例行维护' }
        ];

        const alerts = [];
        const now = new Date();

        alertTypes.forEach((alertType, index) => {
            const alertTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
            
            alerts.push({
                id: `alert-${Date.now()}-${index}`,
                type: alertType.type,
                severity: alertType.severity,
                message: alertType.message,
                timestamp: alertTime.toISOString(),
                status: Math.random() > 0.3 ? 'active' : 'resolved',
                location: this.getRandomLocation(),
                source: this.getAlertSource(alertType.type),
                acknowledged: Math.random() > 0.5,
                acknowledgedBy: Math.random() > 0.5 ? this.getRandomOperator() : null,
                resolvedAt: Math.random() > 0.7 ? new Date(alertTime.getTime() + Math.random() * 2 * 60 * 60 * 1000).toISOString() : null
            });
        });

        return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // 辅助方法：获取随机状态
    getRandomStatus() {
        const statuses = ['running', 'idle', 'maintenance', 'error'];
        const weights = [0.7, 0.15, 0.1, 0.05]; // 运行概率最高
        
        const random = Math.random();
        let sum = 0;
        
        for (let i = 0; i < statuses.length; i++) {
            sum += weights[i];
            if (random <= sum) {
                return statuses[i];
            }
        }
        
        return 'running';
    }

    // 辅助方法：获取随机位置
    getRandomLocation() {
        const locations = [
            '采掘区A', '采掘区B', '采掘区C',
            '运输通道1', '运输通道2', '运输通道3',
            '设备维护区', '原料堆放区', '成品区',
            '办公区', '入口检查站', '中央控制室'
        ];
        
        return locations[Math.floor(Math.random() * locations.length)];
    }

    // 辅助方法：获取随机日期
    getRandomDate(daysOffset) {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset + Math.floor(Math.random() * 30));
        return date.toISOString().split('T')[0];
    }

    // 辅助方法：获取随机操作员
    getRandomOperator() {
        const operators = [
            '张三', '李四', '王五', '赵六', '钱七',
            '孙八', '周九', '吴十', '郑一', '冯二'
        ];
        
        return operators[Math.floor(Math.random() * operators.length)];
    }

    // 生成维护计划
    generateMaintenanceSchedule(equipment) {
        const schedule = [];
        const today = new Date();
        
        equipment.forEach(item => {
            if (item.status === 'maintenance' || Math.random() > 0.8) {
                const maintenanceDate = new Date(today);
                maintenanceDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
                
                schedule.push({
                    equipmentId: item.id,
                    equipmentName: item.name,
                    type: Math.random() > 0.5 ? '例行维护' : '预防性维护',
                    scheduledDate: maintenanceDate.toISOString().split('T')[0],
                    estimatedDuration: Math.floor(Math.random() * 8 + 2) + ' 小时',
                    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                    assignedTechnician: this.getRandomOperator(),
                    description: '设备例行检查和维护保养'
                });
            }
        });
        
        return schedule.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    }

    // 生成传感器数值
    generateSensorValue(min, max, type) {
        let value;
        
        switch (type) {
            case 'temperature':
                value = min + Math.random() * (max - min);
                break;
            case 'humidity':
                value = min + Math.random() * (max - min);
                break;
            case 'gas':
                value = min + Math.random() * (max - min);
                break;
            case 'pressure':
                value = min + Math.random() * (max - min);
                break;
            case 'vibration':
                value = min + Math.random() * (max - min);
                break;
            case 'noise':
                value = min + Math.random() * (max - min);
                break;
            default:
                value = min + Math.random() * (max - min);
        }
        
        return Math.round(value * 100) / 100;
    }

    // 获取传感器状态
    getSensorStatus(value, sensorType) {
        const { min, max } = sensorType;
        const warningThreshold = max * 0.8;
        
        if (Math.random() > 0.95) {
            return 'offline';
        } else if (value >= max || value <= min) {
            return 'error';
        } else if (value >= warningThreshold) {
            return 'warning';
        } else {
            return 'normal';
        }
    }

    // 生成传感器历史数据
    generateSensorHistory(min, max, type) {
        const history = [];
        const now = new Date();
        
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            const value = this.generateSensorValue(min, max, type);
            
            history.push({
                timestamp: time.toISOString(),
                value: value
            });
        }
        
        return history;
    }

    // 获取报警源
    getAlertSource(type) {
        const sources = {
            safety: ['安全监控系统', '人员定位系统', '紧急按钮', '安全传感器'],
            equipment: ['设备监控系统', '振动传感器', '温度传感器', '压力传感器'],
            production: ['生产管理系统', '产量监控', '质量检测', '流程控制'],
            environment: ['环境监测系统', '气体传感器', '空气质量监测', '噪音监测']
        };
        
        const sourceList = sources[type] || sources.equipment;
        return sourceList[Math.floor(Math.random() * sourceList.length)];
    }

    // 启动数据更新
    startDataUpdate() {
        if (this.isRunning) {
            return;
        }
        
        this.isRunning = true;
        
        // 每30秒更新一次数据
        this.updateInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 30000);
        
        console.log('数据自动更新已启动');
    }

    // 停止数据更新
    stopDataUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        this.isRunning = false;
        console.log('数据自动更新已停止');
    }

    // 更新实时数据
    updateRealTimeData() {
        // 更新概览数据
        this.updateOverviewData();
        
        // 更新监控数据
        this.updateMonitoringData();
        
        // 更新设备状态
        this.updateEquipmentStatus();
        
        // 可能生成新的报警
        this.maybeGenerateNewAlert();
        
        // 触发数据更新事件
        this.dispatchDataUpdateEvent();
    }

    // 更新概览数据
    updateOverviewData() {
        const overview = this.data.overview;
        
        // 随机更新一些数值
        if (Math.random() > 0.7) {
            overview.totalProduction.value += Math.floor(Math.random() * 100 - 50);
            overview.efficiency.value += (Math.random() - 0.5) * 2;
            overview.efficiency.value = Math.max(70, Math.min(100, overview.efficiency.value));
        }
        
        if (Math.random() > 0.8) {
            overview.onlinePersonnel.value += Math.floor(Math.random() * 6 - 3);
            overview.onlinePersonnel.value = Math.max(100, Math.min(200, overview.onlinePersonnel.value));
        }
    }

    // 更新监控数据
    updateMonitoringData() {
        this.data.monitoring.sensors.forEach(sensor => {
            if (Math.random() > 0.3) { // 70%的概率更新传感器数据
                const { min, max } = sensor.threshold;
                sensor.value = this.generateSensorValue(min, max, sensor.type);
                sensor.status = this.getSensorStatus(sensor.value, { min, max });
                sensor.lastUpdate = new Date().toISOString();
                
                // 更新历史数据
                sensor.history.push({
                    timestamp: new Date().toISOString(),
                    value: sensor.value
                });
                
                // 保持最多24小时的历史数据
                if (sensor.history.length > 24) {
                    sensor.history.shift();
                }
            }
        });
        
        // 更新汇总信息
        const sensors = this.data.monitoring.sensors;
        this.data.monitoring.summary = {
            total: sensors.length,
            normal: sensors.filter(s => s.status === 'normal').length,
            warning: sensors.filter(s => s.status === 'warning').length,
            error: sensors.filter(s => s.status === 'error').length,
            offline: sensors.filter(s => s.status === 'offline').length
        };
    }

    // 更新设备状态
    updateEquipmentStatus() {
        this.data.equipment.equipment.forEach(equipment => {
            if (Math.random() > 0.9) { // 10%的概率更新设备状态
                equipment.status = this.getRandomStatus();
                equipment.efficiency = equipment.status === 'running' ? 
                    Math.round((80 + Math.random() * 20) * 10) / 10 : 0;
                equipment.temperature = Math.round((60 + Math.random() * 40) * 10) / 10;
                equipment.vibration = Math.round(Math.random() * 10 * 10) / 10;
                equipment.fuelLevel = Math.max(0, equipment.fuelLevel - Math.random() * 5);
            }
        });
        
        // 更新统计信息
        const equipment = this.data.equipment.equipment;
        const totalCount = equipment.length;
        const runningCount = equipment.filter(e => e.status === 'running').length;
        const maintenanceCount = equipment.filter(e => e.status === 'maintenance').length;
        const idleCount = equipment.filter(e => e.status === 'idle').length;
        const errorCount = equipment.filter(e => e.status === 'error').length;

        this.data.equipment.statistics = {
            total: totalCount,
            running: runningCount,
            maintenance: maintenanceCount,
            idle: idleCount,
            error: errorCount,
            efficiency: Math.round((runningCount / totalCount) * 100 * 10) / 10
        };
    }

    // 可能生成新报警
    maybeGenerateNewAlert() {
        if (Math.random() > 0.95) { // 5%的概率生成新报警
            const alertTypes = [
                { type: 'safety', severity: 'medium', message: '检测到人员未佩戴安全帽' },
                { type: 'equipment', severity: 'low', message: '设备运行时间超过预期' },
                { type: 'environment', severity: 'medium', message: '粉尘浓度超标' },
                { type: 'production', severity: 'low', message: '生产效率下降' }
            ];
            
            const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const newAlert = {
                id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: alertType.type,
                severity: alertType.severity,
                message: alertType.message,
                timestamp: new Date().toISOString(),
                status: 'active',
                location: this.getRandomLocation(),
                source: this.getAlertSource(alertType.type),
                acknowledged: false,
                acknowledgedBy: null,
                resolvedAt: null
            };
            
            this.data.alerts.unshift(newAlert);
            
            // 保持最多50个报警记录
            if (this.data.alerts.length > 50) {
                this.data.alerts = this.data.alerts.slice(0, 50);
            }
        }
    }

    // 触发数据更新事件
    dispatchDataUpdateEvent() {
        const event = new CustomEvent('dataUpdated', {
            detail: {
                timestamp: new Date().toISOString(),
                data: this.data
            }
        });
        
        document.dispatchEvent(event);
    }

    // 获取数据
    getData(category) {
        if (category) {
            return this.data[category];
        }
        return this.data;
    }

    // 获取实时数据
    getRealTimeData() {
        return {
            overview: this.data.overview,
            monitoring: this.data.monitoring,
            alerts: this.data.alerts.filter(alert => alert.status === 'active').slice(0, 10)
        };
    }

    // 导出数据
    exportData(format = 'json') {
        const dataToExport = {
            timestamp: new Date().toISOString(),
            data: this.data
        };
        
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mining-platform-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
        }
    }

    // 销毁数据管理器
    destroy() {
        this.stopDataUpdate();
        this.data = null;
        console.log('数据管理器已销毁');
    }

    // 生成人员数据
    generatePersonnelData() {
        return {
            name: '张工程师',
            status: '在线',
            workHours: '8.5h',
            efficiency: '95%',
            tasks: '12',
            avatar: '👨‍💼'
        };
    }

    // 生成进度数据
    generateProgressData() {
        return [
            { label: '产量', value: 85 },
            { label: '效率', value: 92 }
        ];
    }

    // 生成表格数据
    generateTableData() {
        const data = [];
        const monitoringPoints = ['A01', 'B02', 'C03', 'D04', 'E05', 'F06', 'G07', 'H08'];
        const indicators = [
            { name: '含水率', unit: '%', min: 20, max: 50, optimal: [25, 40] },
            { name: '降雨量', unit: 'mm', min: 0, max: 100, optimal: [10, 30] },
            { name: '坡体位移', unit: 'mm', min: 0, max: 10, optimal: [0, 3] },
            { name: '植被覆盖', unit: '%', min: 40, max: 95, optimal: [70, 90] }
        ];
        
        for (let i = 0; i < 8; i++) {
            const indicator = indicators[i % indicators.length];
            const value = this.generateEcologicalValue(indicator);
            const status = this.getEcologicalStatus(value, indicator);
            
            data.push({
                id: monitoringPoints[i],
                point: monitoringPoints[i],
                indicator: indicator.name,
                value: `${value}${indicator.unit}`,
                rawValue: value,
                status: status,
                statusText: this.getEcologicalStatusText(status),
                time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
                trend: this.getValueTrend(),
                threshold: indicator.optimal
            });
        }
        
        return data;
    }

    // 生成生态指标数值
    generateEcologicalValue(indicator) {
        const range = indicator.max - indicator.min;
        const baseValue = indicator.min + Math.random() * range;
        
        // 添加一些变化使数据更真实
        const variation = (Math.random() - 0.5) * range * 0.1;
        const finalValue = Math.max(indicator.min, Math.min(indicator.max, baseValue + variation));
        
        return Math.round(finalValue * 10) / 10;
    }

    // 获取生态指标状态
    getEcologicalStatus(value, indicator) {
        const [optimalMin, optimalMax] = indicator.optimal;
        
        if (value >= optimalMin && value <= optimalMax) {
            return 'good';
        } else if (value < optimalMin * 0.8 || value > optimalMax * 1.2) {
            return 'warning';
        } else if (value < optimalMin * 0.6 || value > optimalMax * 1.4) {
            return 'danger';
        } else {
            return 'normal';
        }
    }

    // 获取生态状态文本
    getEcologicalStatusText(status) {
        const statusTexts = {
            'good': '良好',
            'normal': '正常',
            'warning': '注意',
            'danger': '警告'
        };
        return statusTexts[status] || '未知';
    }

    // 获取数值趋势
    getValueTrend() {
        const trends = ['up', 'down', 'stable'];
        return trends[Math.floor(Math.random() * trends.length)];
    }

    // 生成产量数据
    generateProductionData() {
        return {
            daily: Math.floor(Math.random() * 500) + 800,
            monthly: Math.floor(Math.random() * 5000) + 15000,
            yearly: Math.floor(Math.random() * 50000) + 180000,
            dailyTarget: 1000,
            monthlyTarget: 20000,
            yearlyTarget: 240000
        };
    }

    // 获取人员数据
    getPersonnelData() {
        return this.data.personnel;
    }

    // 获取进度数据
    getProgressData() {
        return this.data.progress;
    }

    // 获取表格数据
    getTableData() {
        return this.data.table;
    }

    // 获取告警数据（用于右侧面板）
    getAlertData() {
        return this.data.alerts;
    }

    // 获取产量数据
    getProductionData() {
        return this.data.productionData || {};
    }

    // 获取设备数据
    getEquipmentData() {
        return this.data.equipment?.equipment || [];
    }

    // 生成真实矿山数据 - 基于USGS和全球矿山数据库
    generateRealMineData() {
        // 真实矿山地理坐标数据（基于中国矿山资源数据）
        const realMines = [
            {
                id: 'mine_003',
                name: '内蒙古准格尔煤矿',
                type: '露天煤矿',
                location: {
                    lat: 39.8612,
                    lng: 111.1851,
                    elevation: 1280,
                    country: 'China',
                    province: '内蒙古自治区',
                    city: '鄂尔多斯市准格尔旗'
                },
                dimensions: {
                    length: 5200,
                    width: 3800,
                    depth: 220
                },
                production: {
                    dailyOutput: 45000,
                    coalGrade: 'sub-bituminous',
                    sulfurContent: 0.4,
                    ashContent: 8.2
                },
                equipment: {
                    trucks: 85,
                    shovels: 15,
                    drills: 12,
                    conveyors: 25
                },
                status: 'active'
            },
            {
                id: 'mine_004',
                name: '内蒙古黑岱沟露天煤矿',
                type: '露天煤矿',
                location: {
                    lat: 39.7234,
                    lng: 111.9876,
                    elevation: 1350,
                    country: 'China',
                    province: '内蒙古自治区',
                    city: '准格尔旗'
                },
                dimensions: {
                    length: 6800,
                    width: 4200,
                    depth: 310
                },
                production: {
                    dailyOutput: 65000,
                    coalGrade: 'sub-bituminous',
                    sulfurContent: 0.3,
                    ashContent: 7.5
                },
                equipment: {
                    trucks: 120,
                    shovels: 22,
                    drills: 18,
                    conveyors: 35
                },
                status: 'active'
            },
            {
                id: 'mine_006',
                name: '重庆重钢歌乐山矿',
                type: '地下铁矿',
                location: {
                    lat: 29.5833,
                    lng: 106.4833,
                    elevation: 678,
                    country: 'China',
                    province: '重庆市',
                    city: '沙坪坝区'
                },
                dimensions: {
                    length: 3500,
                    width: 2200,
                    depth: 420
                },
                production: {
                    dailyOutput: 4200,
                    oreGrade: 'iron_ore',
                    ironContent: 58.5,
                    sulfurContent: 0.3
                },
                equipment: {
                    trucks: 22,
                    loaders: 8,
                    drills: 6,
                    conveyors: 12
                },
                status: 'active'
            }
        ];

        this.data.realMineData = {
            mines: realMines,
            selectedMine: null, // 不设置默认矿山，让用户主动选择
            totalMines: realMines.length,
            activeMines: realMines.filter(m => m.status === 'active').length
        };
    }

    // 生成卫星图像数据
    generateSatelliteImagery() {
        const selectedMine = this.data.realMineData?.selectedMine;
        if (!selectedMine) return;

        this.data.satelliteImagery = {
            baseImageUrl: `https://restapi.amap.com/v3/staticmap?location=${selectedMine.location.lng},${selectedMine.location.lat}&zoom=15&size=1024*1024&markers=mid,,A:${selectedMine.location.lng},${selectedMine.location.lat}&key=${window.getAmapServiceKey ? window.getAmapServiceKey() : (window.getAmapApiKey ? window.getAmapApiKey() : 'YOUR_AMAP_API_KEY')}`,
            terrainData: {
                elevationModel: this.generateElevationModel(selectedMine),
                contourLines: this.generateContourLines(selectedMine),
                geologicalLayers: this.generateGeologicalLayers(selectedMine)
            },
            spectralAnalysis: {
                visibleSpectrum: this.generateSpectralData('visible'),
                infraredSpectrum: this.generateSpectralData('infrared'),
                thermalSpectrum: this.generateSpectralData('thermal')
            },
            temporalData: {
                acquisitionDate: new Date().toISOString(),
                resolution: '0.5m',
                cloudCover: Math.random() * 10,
                sunAngle: 45 + Math.random() * 30
            }
        };
    }

    // 生成数字孪生数据
    generateDigitalTwinData() {
        const selectedMine = this.data.realMineData?.selectedMine;
        if (!selectedMine) return;

        this.data.digitalTwin = {
            syncStatus: 'connected',
            lastUpdate: new Date().toISOString(),
            realTimeStreams: {
                equipmentTelemetry: this.generateEquipmentTelemetry(selectedMine),
                environmentalSensors: this.generateEnvironmentalSensors(selectedMine),
                productionMetrics: this.generateProductionMetrics(selectedMine),
                safetyMonitoring: this.generateSafetyMonitoring(selectedMine)
            },
            simulation: {
                weatherConditions: this.generateWeatherSimulation(),
                trafficFlow: this.generateTrafficSimulation(selectedMine),
                blastSimulation: this.generateBlastSimulation(),
                equipmentOptimization: this.generateOptimizationData(selectedMine)
            },
            predictiveAnalytics: {
                equipmentFailure: this.generateFailurePrediction(),
                productionForecast: this.generateProductionForecast(),
                maintenanceSchedule: this.generateMaintenanceOptimization(),
                environmentalImpact: this.generateEnvironmentalPrediction()
            }
        };
    }

    // 辅助方法：生成高程模型
    generateElevationModel(mine) {
        const elevations = [];
        const gridSize = 50;
        
        for (let i = 0; i < gridSize; i++) {
            const row = [];
            for (let j = 0; j < gridSize; j++) {
                const baseElevation = mine.location.elevation;
                const variation = (Math.sin(i * 0.2) + Math.cos(j * 0.3)) * 100;
                const pitDepth = mine.type.includes('露天') ? 
                    Math.max(0, (gridSize/2 - Math.sqrt((i-gridSize/2)**2 + (j-gridSize/2)**2)) * 20) : 0;
                row.push(baseElevation + variation - pitDepth);
            }
            elevations.push(row);
        }
        
        return elevations;
    }

    // 辅助方法：生成等高线
    generateContourLines(mine) {
        const lines = [];
        const baseElevation = mine.location.elevation;
        
        for (let elevation = baseElevation - mine.dimensions.depth; 
             elevation <= baseElevation + 200; 
             elevation += 50) {
            lines.push({
                elevation: elevation,
                coordinates: this.generateContourCoordinates(mine, elevation)
            });
        }
        
        return lines;
    }

    // 辅助方法：生成地质图层
    generateGeologicalLayers(mine) {
        return [
            {
                name: '表土层',
                depth: '0-5m',
                composition: '粘土、砂石',
                color: '#8B4513'
            },
            {
                name: '风化层',
                depth: '5-20m',
                composition: '风化岩石',
                color: '#A0522D'
            },
            {
                name: '矿化带',
                depth: '20-200m',
                composition: mine.type.includes('铜') ? '铜矿石' : '金矿石',
                color: mine.type.includes('铜') ? '#B87333' : '#FFD700'
            },
            {
                name: '基岩',
                depth: '200m+',
                composition: '花岗岩、片麻岩',
                color: '#696969'
            }
        ];
    }

    // 辅助方法：生成光谱数据
    generateSpectralData(type) {
        const bands = [];
        const bandCount = type === 'visible' ? 3 : type === 'infrared' ? 8 : 5;
        
        for (let i = 0; i < bandCount; i++) {
            bands.push({
                band: i + 1,
                wavelength: type === 'visible' ? 
                    [450, 550, 650][i] : 
                    type === 'infrared' ? 
                    800 + i * 200 : 
                    8000 + i * 2000,
                reflectance: Math.random() * 0.8 + 0.1
            });
        }
        
        return bands;
    }

    // 获取真实矿山数据
    getRealMineData() {
        return this.data.realMineData || {};
    }

    // 获取卫星图像数据
    getSatelliteImagery() {
        return this.data.satelliteImagery || {};
    }

    // 获取数字孪生数据
    getDigitalTwinData() {
        return this.data.digitalTwin || {};
    }

    // 切换矿山
    switchMine(mineId) {
        console.log('🔄 DataManager.switchMine 被调用，矿山ID:', mineId);
        console.log('📊 当前realMineData状态:', !!this.data.realMineData);
        console.log('⛏️ 可用矿山数量:', this.data.realMineData?.mines?.length);
        
        const mine = this.data.realMineData?.mines.find(m => m.id === mineId);
        if (mine) {
            console.log('✅ 找到矿山:', mine.name, '坐标:', mine.location);
            this.data.realMineData.selectedMine = mine;
            console.log('🎯 已设置selectedMine:', this.data.realMineData.selectedMine.name);
            this.generateSatelliteImagery();
            this.generateDigitalTwinData();
            this.dispatchDataUpdateEvent();
        } else {
            console.error('❌ 未找到矿山ID:', mineId);
            console.log('📋 可用矿山列表:', this.data.realMineData?.mines?.map(m => ({id: m.id, name: m.name})));
        }
    }

    // 获取当前矿山信息
    getCurrentMineInfo() {
        const selectedMine = this.data.realMineData?.selectedMine;
        console.log('📍 DataManager.getCurrentMineInfo 被调用');
        console.log('🎯 当前selectedMine:', selectedMine ? selectedMine.name : '无');
        
        if (selectedMine) {
            const result = {
                lat: selectedMine.location.lat,
                lng: selectedMine.location.lng,
                name: selectedMine.name,
                type: selectedMine.type,
                bounds: {
                    north: selectedMine.location.lat + 0.01,
                    south: selectedMine.location.lat - 0.01,
                    east: selectedMine.location.lng + 0.01,
                    west: selectedMine.location.lng - 0.01
                }
            };
            console.log('✅ 返回选中矿山信息:', result);
            return result;
        }
        // 没有选中矿山时返回null
        console.log('⚠️ 没有选中矿山，返回null');
        return null;
    }

    // 生成等高线坐标
    generateContourCoordinates(mine, elevation) {
        const coords = [];
        const centerLat = mine.location.lat;
        const centerLng = mine.location.lng;
        const radius = 0.01; // 约1km
        
        for (let angle = 0; angle < 360; angle += 10) {
            const rad = (angle * Math.PI) / 180;
            const lat = centerLat + radius * Math.cos(rad);
            const lng = centerLng + radius * Math.sin(rad);
            coords.push([lng, lat]);
        }
        
        return coords;
    }

    // 生成设备遥测数据
    generateEquipmentTelemetry(mine) {
        const telemetry = [];
        
        for (let i = 0; i < mine.equipment.trucks; i++) {
            telemetry.push({
                id: `truck_${i + 1}`,
                type: 'mining_truck',
                location: {
                    lat: mine.location.lat + (Math.random() - 0.5) * 0.02,
                    lng: mine.location.lng + (Math.random() - 0.5) * 0.02,
                    elevation: mine.location.elevation - Math.random() * mine.dimensions.depth
                },
                status: Math.random() > 0.1 ? 'operational' : 'maintenance',
                speed: Math.random() * 25, // km/h
                fuelLevel: Math.random() * 100,
                payload: Math.random() * 400, // tons
                engineTemp: 80 + Math.random() * 40,
                lastUpdate: new Date().toISOString()
            });
        }
        
        return telemetry;
    }

    // 生成环境传感器数据
    generateEnvironmentalSensors(mine) {
        return {
            airQuality: {
                pm25: 15 + Math.random() * 35,
                pm10: 25 + Math.random() * 50,
                co2: 400 + Math.random() * 100,
                dust: Math.random() * 500
            },
            weather: {
                temperature: 20 + Math.random() * 15,
                humidity: 40 + Math.random() * 40,
                windSpeed: Math.random() * 20,
                windDirection: Math.random() * 360,
                pressure: 1000 + Math.random() * 50
            },
            noise: {
                level: 70 + Math.random() * 30,
                frequency: 500 + Math.random() * 2000
            },
            vibration: {
                amplitude: Math.random() * 10,
                frequency: 10 + Math.random() * 90
            }
        };
    }

    // 生成生产指标数据
    generateProductionMetrics(mine) {
        return {
            currentOutput: mine.production.dailyOutput * (0.8 + Math.random() * 0.4),
            efficiency: 85 + Math.random() * 15,
            oreGrade: {
                copper: mine.production.copperGrade * (0.9 + Math.random() * 0.2),
                gold: mine.production.goldGrade * (0.9 + Math.random() * 0.2),
                silver: mine.production.silverGrade * (0.9 + Math.random() * 0.2)
            },
            wasteRatio: 2.5 + Math.random() * 1.5,
            energyConsumption: 150 + Math.random() * 50, // MWh
            waterUsage: 1000 + Math.random() * 500 // m³
        };
    }

    // 生成安全监控数据
    generateSafetyMonitoring(mine) {
        return {
            personnelCount: Math.floor(200 + Math.random() * 300),
            emergencyExits: 12,
            fireDetectors: 45,
            gasDetectors: 30,
            slopeStability: {
                status: Math.random() > 0.05 ? 'stable' : 'warning',
                movement: Math.random() * 5, // mm/day
                lastInspection: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            incidents: Math.floor(Math.random() * 3),
            nearMisses: Math.floor(Math.random() * 8)
        };
    }

    // 生成天气模拟
    generateWeatherSimulation() {
        return {
            current: {
                condition: ['sunny', 'cloudy', 'rainy', 'windy'][Math.floor(Math.random() * 4)],
                visibility: 5 + Math.random() * 15, // km
                precipitation: Math.random() * 10 // mm
            },
            forecast: Array.from({length: 7}, (_, i) => ({
                day: i + 1,
                condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
                tempMax: 25 + Math.random() * 10,
                tempMin: 15 + Math.random() * 10,
                precipitation: Math.random() * 20
            }))
        };
    }

    // 生成交通流模拟
    generateTrafficSimulation(mine) {
        return {
            mainRoad: {
                congestion: Math.random() * 100,
                avgSpeed: 15 + Math.random() * 20,
                vehicleCount: Math.floor(mine.equipment.trucks * 0.7)
            },
            haulingRoutes: Array.from({length: 5}, (_, i) => ({
                routeId: `route_${i + 1}`,
                utilization: Math.random() * 100,
                avgCycleTime: 45 + Math.random() * 30, // minutes
                bottlenecks: Math.random() > 0.7 ? ['loading_point', 'dump_area'][Math.floor(Math.random() * 2)] : null
            }))
        };
    }

    // 生成爆破模拟
    generateBlastSimulation() {
        return {
            nextBlast: {
                scheduled: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Bench_A_Level_1520',
                explosiveAmount: 500 + Math.random() * 1000, // kg
                expectedYield: 15000 + Math.random() * 10000 // tons
            },
            vibrationPrediction: {
                maxVelocity: 5 + Math.random() * 15, // mm/s
                frequency: 10 + Math.random() * 40, // Hz
                affectedRadius: 500 + Math.random() * 1000 // meters
            }
        };
    }

    // 生成优化数据
    generateOptimizationData(mine) {
        return {
            routeOptimization: {
                currentEfficiency: 75 + Math.random() * 20,
                potentialImprovement: Math.random() * 15,
                recommendedChanges: ['调整装载点位置', '优化卸载顺序', '增加运输车辆'][Math.floor(Math.random() * 3)]
            },
            energyOptimization: {
                currentConsumption: 150 + Math.random() * 50,
                potentialSavings: Math.random() * 20,
                recommendations: ['使用电动设备', '优化设备调度', '改进维护计划'][Math.floor(Math.random() * 3)]
            }
        };
    }

    // 生成故障预测
    generateFailurePrediction() {
        return {
            highRisk: Math.floor(Math.random() * 5),
            mediumRisk: Math.floor(Math.random() * 10),
            lowRisk: Math.floor(Math.random() * 20),
            predictions: Array.from({length: 3}, (_, i) => ({
                equipmentId: `equipment_${i + 1}`,
                failureType: ['hydraulic_failure', 'engine_overheating', 'tire_wear'][i],
                probability: Math.random() * 100,
                timeToFailure: Math.floor(Math.random() * 30) + 1 // days
            }))
        };
    }

    // 生成生产预测
    generateProductionForecast() {
        return {
            daily: Array.from({length: 30}, (_, i) => ({
                day: i + 1,
                predictedOutput: 400000 + Math.random() * 100000,
                confidence: 80 + Math.random() * 15
            })),
            monthly: Array.from({length: 12}, (_, i) => ({
                month: i + 1,
                predictedOutput: 12000000 + Math.random() * 3000000,
                confidence: 75 + Math.random() * 20
            }))
        };
    }

    // 生成维护优化
    generateMaintenanceOptimization() {
        return {
            scheduledMaintenance: Array.from({length: 10}, (_, i) => ({
                equipmentId: `equipment_${i + 1}`,
                type: ['preventive', 'predictive', 'corrective'][Math.floor(Math.random() * 3)],
                scheduledDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedDuration: Math.floor(Math.random() * 8) + 1, // hours
                priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
            })),
            optimization: {
                costSavings: Math.random() * 100000,
                downtimeReduction: Math.random() * 20,
                efficiencyGain: Math.random() * 15
            }
        };
    }

    // 生成环境影响预测
    generateEnvironmentalPrediction() {
        return {
            airQuality: {
                trend: Math.random() > 0.5 ? 'improving' : 'stable',
                projectedPM25: 20 + Math.random() * 30,
                complianceStatus: 'compliant'
            },
            waterUsage: {
                currentUsage: 1500 + Math.random() * 500,
                projectedUsage: 1400 + Math.random() * 600,
                recyclingRate: 60 + Math.random() * 30
            },
            carbonFootprint: {
                currentEmissions: 50000 + Math.random() * 20000, // tons CO2/year
                projectedReduction: Math.random() * 15,
                offsetPrograms: ['reforestation', 'renewable_energy'][Math.floor(Math.random() * 2)]
            }
        };
    }

    // 生成四个主题的状态栏内容数据
    generateThemeContents() {
        return {
            dashboard: {
                left: {
                    sections: [
                        {
                            title: "实时监控",
                            type: "monitoring",
                            items: [
                                { label: "温度监测", value: "25.6°C", progress: 65 },
                                { label: "湿度监测", value: "68.2%", progress: 68 },
                                { label: "气体浓度", value: "0.02%", progress: 20 }
                            ]
                        },
                        {
                            title: "生产状态",
                            type: "status",
                            items: [
                                { label: "日产量", value: "1,245.6吨", status: "良好", trend: "up" },
                                { label: "设备运行率", value: "87.3%", status: "正常", trend: "stable" },
                                { label: "能耗指标", value: "2,456kWh", status: "优化", trend: "down" }
                            ]
                        },
                        {
                            title: "安全监测",
                            type: "safety",
                            items: [
                                { icon: "🔥", label: "瓦斯浓度", value: "0.3%", status: "safe", statusText: "安全" },
                                { icon: "💨", label: "通风状态", value: "良好", status: "safe", statusText: "正常" },
                                { icon: "⚡", label: "电力系统", value: "稳定", status: "safe", statusText: "正常" }
                            ]
                        }
                    ]
                },
                right: {
                    sections: [
                        {
                            title: "关键指标",
                            type: "status",
                            items: [
                                { label: "日产量", value: "1,245.6吨", status: "良好", trend: "up" },
                                { label: "设备利用率", value: "87.3%", status: "正常", trend: "stable" },
                                { label: "能耗指标", value: "2,456kWh", status: "优化", trend: "down" }
                            ]
                        },
                        {
                            title: "效率趋势分析",
                            type: "monitoring",
                            items: [
                                { label: "生产效率", value: "92%", progress: 92 },
                                { label: "设备效率", value: "88%", progress: 88 },
                                { label: "人员效率", value: "85%", progress: 85 }
                            ]
                        }
                    ]
                }
            },
            monitoring: {
                left: {
                    sections: [
                        {
                            title: "环境参数",
                            type: "monitoring",
                            items: [
                                { label: "温度", value: "24°C", progress: 60 },
                                { label: "湿度", value: "65%", progress: 65 },
                                { label: "气压", value: "1013hPa", progress: 75 }
                            ]
                        },
                        {
                            title: "空气质量",
                            type: "monitoring",
                            items: [
                                { label: "PM2.5", value: "35μg/m³", progress: 35 },
                                { label: "CO浓度", value: "8ppm", progress: 40 },
                                { label: "O₂浓度", value: "20.8%", progress: 85 }
                            ]
                        },
                        {
                            title: "噪音监测",
                            type: "monitoring",
                            items: [
                                { label: "环境噪音", value: "68dB", progress: 68 },
                                { label: "设备噪音", value: "75dB", progress: 75 },
                                { label: "作业噪音", value: "82dB", progress: 82 }
                            ]
                        }
                    ]
                },
                right: {
                    sections: [
                        {
                            title: "产量统计",
                            type: "status",
                            items: [
                                { label: "日产量", value: "1,250吨", status: "良好", trend: "up" },
                                { label: "月累计", value: "38,750吨", status: "正常", trend: "up" },
                                { label: "年累计", value: "456,800吨", status: "优秀", trend: "up" }
                            ]
                        },
                        {
                            title: "效率指标",
                            type: "monitoring",
                            items: [
                                { label: "设备利用率", value: "92%", progress: 92 },
                                { label: "人员效率", value: "88%", progress: 88 },
                                { label: "能耗比", value: "0.85", progress: 85 }
                            ]
                        }
                    ]
                }
            },
            safety: {
                left: {
                    sections: [
                        {
                            title: "人员安全",
                            type: "status",
                            items: [
                                { label: "在岗人数", value: "156人", status: "正常", trend: "stable" },
                                { label: "安全培训", value: "100%", status: "优秀", trend: "stable" },
                                { label: "违规记录", value: "0起", status: "优秀", trend: "stable" }
                            ]
                        },
                        {
                            title: "设备安全",
                            type: "monitoring",
                            items: [
                                { label: "设备完好率", value: "98.5%", progress: 98 },
                                { label: "故障预警", value: "2个", progress: 20 },
                                { label: "维护计划", value: "按期", progress: 100 }
                            ]
                        },
                        {
                            title: "环境安全",
                            type: "monitoring",
                            items: [
                                { label: "瓦斯浓度", value: "0.3%", progress: 30 },
                                { label: "粉尘浓度", value: "8mg/m³", progress: 40 },
                                { label: "通风状况", value: "良好", progress: 85 }
                            ]
                        }
                    ]
                },
                right: {
                    sections: [
                        {
                            title: "应急状态",
                            type: "status",
                            items: [
                                { label: "响应级别", value: "正常", status: "优秀", trend: "stable" },
                                { label: "应急人员", value: "24人", status: "正常", trend: "stable" },
                                { label: "救援设备", value: "就绪", status: "优秀", trend: "stable" }
                            ]
                        },
                        {
                            title: "风险评估",
                            type: "monitoring",
                            items: [
                                { label: "整体风险", value: "低", progress: 15 },
                                { label: "重点区域", value: "3个", progress: 30 },
                                { label: "预警信号", value: "无", progress: 0 }
                            ]
                        }
                    ]
                }
            },
            equipment: {
                left: {
                    sections: [
                        {
                            title: "设备状态",
                            type: "status",
                            items: [
                                { label: "运行设备", value: "45台", status: "正常", trend: "stable" },
                                { label: "维护设备", value: "3台", status: "警告", trend: "stable" },
                                { label: "故障设备", value: "1台", status: "危险", trend: "stable" }
                            ]
                        },
                        {
                            title: "维护计划",
                            type: "monitoring",
                            items: [
                                { label: "今日维护", value: "2台", progress: 40 },
                                { label: "本周计划", value: "8台", progress: 60 },
                                { label: "逾期维护", value: "0台", progress: 0 }
                            ]
                        },
                        {
                            title: "备件库存",
                            type: "monitoring",
                            items: [
                                { label: "库存充足", value: "85%", progress: 85 },
                                { label: "低库存", value: "12%", progress: 12 },
                                { label: "缺货", value: "3%", progress: 3 }
                            ]
                        }
                    ]
                },
                right: {
                    sections: [
                        {
                            title: "运行效率",
                            type: "monitoring",
                            items: [
                                { label: "平均效率", value: "89%", progress: 89 },
                                { label: "能耗指标", value: "标准", progress: 75 },
                                { label: "故障率", value: "2.1%", progress: 21 }
                            ]
                        },
                        {
                            title: "预测维护",
                            type: "status",
                            items: [
                                { label: "预警设备", value: "5台", status: "警告", trend: "stable" },
                                { label: "剩余寿命", value: "平均8个月", status: "正常", trend: "stable" },
                                { label: "维护成本", value: "预算内", status: "优秀", trend: "stable" }
                            ]
                        }
                    ]
                }
            }
        };
    }

    // 获取主题内容数据
    getThemeContents(theme) {
        return this.data.themeContents[theme] || this.data.themeContents.dashboard;
    }
}

// 创建全局实例
window.DataManager = new DataManager();

// 导出数据管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}