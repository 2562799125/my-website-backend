// 图表管理器
class ChartsManager {
    constructor() {
        this.charts = {};
        this.isInitialized = false;
        this.updateInterval = null;
    }

    // 初始化所有图表
    init() {
        if (this.isInitialized) {
            return;
        }

        this.initProductionChart();
        this.initRealTimeChart();
        this.initReportChart();
        this.initYieldChart();
        this.initEfficiencyChart();
        this.initSideProductionChart();
        this.initEfficiencyTrendChart();
        this.startAutoUpdate();
        
        this.isInitialized = true;
        console.log('图表管理器初始化完成');
    }

    // 初始化生产趋势图表
    initProductionChart() {
        const canvas = document.getElementById('productionChart');
        if (!canvas) {
            console.warn('生产图表画布未找到');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // 生成模拟数据
        const labels = this.generateTimeLabels(7); // 最近7天
        const productionData = this.generateProductionData(7);
        const efficiencyData = this.generateEfficiencyData(7);

        this.charts.production = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '日产量 (吨)',
                        data: productionData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#4CAF50',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: '生产效率 (%)',
                        data: efficiencyData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#2196F3',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '生产趋势分析',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#4CAF50',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '日期',
                            color: '#666',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '产量 (吨)',
                            color: '#4CAF50',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(76, 175, 80, 0.2)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#4CAF50',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '效率 (%)',
                            color: '#2196F3',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#2196F3',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // 初始化实时监控图表
    initRealTimeChart() {
        const canvas = document.getElementById('realTimeChart');
        if (!canvas) {
            console.warn('实时图表画布未找到');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // 生成实时数据标签（最近30个时间点）
        const labels = this.generateRealTimeLabels(30);
        const temperatureData = this.generateTemperatureData(30);
        const humidityData = this.generateHumidityData(30);
        const gasData = this.generateGasData(30);

        this.charts.realTime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '温度 (°C)',
                        data: temperatureData,
                        borderColor: '#FF6B35',
                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6
                    },
                    {
                        label: '湿度 (%)',
                        data: humidityData,
                        borderColor: '#4ECDC4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6
                    },
                    {
                        label: '气体浓度 (%)',
                        data: gasData,
                        borderColor: '#FFE66D',
                        backgroundColor: 'rgba(255, 230, 109, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '实时环境监控',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '时间',
                            color: '#666'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '数值',
                            color: '#666'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });

        // 启动实时数据更新
        this.startRealTimeUpdate();
    }

    // 初始化报表图表
    initReportChart() {
        const canvas = document.getElementById('reportChart');
        if (!canvas) {
            console.warn('报表图表画布未找到');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        this.charts.report = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [
                    {
                        label: '月产量 (千吨)',
                        data: [65, 72, 68, 75, 82, 78],
                        backgroundColor: [
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(33, 150, 243, 0.8)',
                            'rgba(255, 193, 7, 0.8)',
                            'rgba(156, 39, 176, 0.8)',
                            'rgba(255, 87, 34, 0.8)',
                            'rgba(96, 125, 139, 0.8)'
                        ],
                        borderColor: [
                            '#4CAF50',
                            '#2196F3',
                            '#FFC107',
                            '#9C27B0',
                            '#FF5722',
                            '#607D8B'
                        ],
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '月度生产报表',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '月份',
                            color: '#666'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '产量 (千吨)',
                            color: '#666'
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutBounce'
                }
            }
        });
    }

    // 生成时间标签
    generateTimeLabels(days) {
        const labels = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { 
                month: 'short', 
                day: 'numeric' 
            }));
        }
        
        return labels;
    }

    // 生成实时时间标签
    generateRealTimeLabels(count) {
        const labels = [];
        const now = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000); // 每分钟一个点
            labels.push(time.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
        }
        
        return labels;
    }

    // 生成生产数据
    generateProductionData(days) {
        const data = [];
        let baseValue = 2000;
        
        for (let i = 0; i < days; i++) {
            const variation = (Math.random() - 0.5) * 400;
            const trend = Math.sin(i * 0.5) * 200;
            baseValue += variation + trend;
            data.push(Math.max(1500, Math.min(3000, Math.round(baseValue))));
        }
        
        return data;
    }

    // 生成效率数据
    generateEfficiencyData(days) {
        const data = [];
        let baseValue = 85;
        
        for (let i = 0; i < days; i++) {
            const variation = (Math.random() - 0.5) * 10;
            baseValue += variation;
            data.push(Math.max(70, Math.min(100, Math.round(baseValue * 10) / 10)));
        }
        
        return data;
    }

    // 生成温度数据
    generateTemperatureData(count) {
        const data = [];
        let baseTemp = 25;
        
        for (let i = 0; i < count; i++) {
            const variation = (Math.random() - 0.5) * 4;
            baseTemp += variation;
            data.push(Math.max(15, Math.min(35, Math.round(baseTemp * 10) / 10)));
        }
        
        return data;
    }

    // 生成湿度数据
    generateHumidityData(count) {
        const data = [];
        let baseHumidity = 65;
        
        for (let i = 0; i < count; i++) {
            const variation = (Math.random() - 0.5) * 10;
            baseHumidity += variation;
            data.push(Math.max(30, Math.min(90, Math.round(baseHumidity))));
        }
        
        return data;
    }

    // 生成气体浓度数据
    generateGasData(count) {
        const data = [];
        let baseGas = 0.02;
        
        for (let i = 0; i < count; i++) {
            const variation = (Math.random() - 0.5) * 0.01;
            baseGas += variation;
            data.push(Math.max(0, Math.min(0.1, Math.round(baseGas * 1000) / 1000)));
        }
        
        return data;
    }

    // 启动实时数据更新
    startRealTimeUpdate() {
        setInterval(() => {
            this.updateRealTimeChart();
        }, 5000); // 每5秒更新一次
    }

    // 更新实时图表
    updateRealTimeChart() {
        if (!this.charts.realTime) {
            return;
        }

        const chart = this.charts.realTime;
        const now = new Date();
        const timeLabel = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // 添加新数据点
        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(this.generateTemperatureData(1)[0]);
        chart.data.datasets[1].data.push(this.generateHumidityData(1)[0]);
        chart.data.datasets[2].data.push(this.generateGasData(1)[0]);

        // 保持最多30个数据点
        if (chart.data.labels.length > 30) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => {
                dataset.data.shift();
            });
        }

        chart.update('none'); // 无动画更新以提高性能
    }

    // 更新报表图表
    updateReportChart(reportType) {
        if (!this.charts.report) {
            return;
        }

        const chart = this.charts.report;
        
        // 根据报表类型更新数据
        const reportData = this.getReportData(reportType);
        
        chart.data.labels = reportData.labels;
        chart.data.datasets[0].label = reportData.label;
        chart.data.datasets[0].data = reportData.data;
        chart.options.plugins.title.text = reportData.title;
        
        chart.update();
    }

    // 获取报表数据
    getReportData(reportType) {
        const reportConfigs = {
            production: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                data: [65, 72, 68, 75, 82, 78],
                label: '月产量 (千吨)',
                title: '月度生产报表'
            },
            safety: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                data: [2, 1, 3, 0, 1, 2],
                label: '安全事件数量',
                title: '月度安全报表'
            },
            equipment: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                data: [95, 97, 94, 98, 96, 99],
                label: '设备正常率 (%)',
                title: '月度设备报表'
            }
        };

        return reportConfigs[reportType] || reportConfigs.production;
    }

    // 启动自动更新
    startAutoUpdate() {
        // 每30秒更新一次生产图表
        this.updateInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.updateProductionChart();
            }
        }, 30000);
    }

    // 更新生产图表
    updateProductionChart() {
        if (!this.charts.production) {
            return;
        }

        const chart = this.charts.production;
        
        // 生成新的数据
        const newProductionData = this.generateProductionData(7);
        const newEfficiencyData = this.generateEfficiencyData(7);
        
        chart.data.datasets[0].data = newProductionData;
        chart.data.datasets[1].data = newEfficiencyData;
        
        chart.update();
    }

    // 调整所有图表大小
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    // 销毁所有图表
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });

        this.charts = {};
        this.isInitialized = false;
    }

    // 获取图表实例
    getChart(name) {
        return this.charts[name];
    }

    // 导出图表为图片
    exportChart(chartName, filename) {
        const chart = this.charts[chartName];
        if (!chart) {
            console.error(`图表 ${chartName} 不存在`);
            return;
        }

        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = filename || `${chartName}-chart.png`;
        link.href = url;
        link.click();
    }

    // 切换图表主题
    switchTheme(isDark) {
        const textColor = isDark ? '#ffffff' : '#2c3e50';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        Object.values(this.charts).forEach(chart => {
            if (chart) {
                // 更新标题颜色
                if (chart.options.plugins.title) {
                    chart.options.plugins.title.color = textColor;
                }

                // 更新坐标轴颜色
                Object.values(chart.options.scales).forEach(scale => {
                    if (scale.title) {
                        scale.title.color = textColor;
                    }
                    if (scale.ticks) {
                        scale.ticks.color = textColor;
                    }
                    if (scale.grid) {
                        scale.grid.color = gridColor;
                    }
                });

                chart.update();
            }
        });
    }

    // 初始化产量监控图表
    initYieldChart() {
        const canvas = document.getElementById('yieldChart');
        if (!canvas) {
            console.warn('产量图表画布未找到');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        this.charts.yield = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: '产量',
                    data: [120, 150, 180, 200, 170, 160],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 212, 255, 0.2)'
                        },
                        ticks: {
                            color: '#00d4ff'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 212, 255, 0.2)'
                        },
                        ticks: {
                            color: '#00d4ff'
                        }
                    }
                }
            }
        });
    }

    // 初始化效率趋势图表
    initEfficiencyChart() {
        const canvas = document.getElementById('efficiencyChart');
        if (!canvas) {
            console.warn('效率图表画布未找到');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        this.charts.efficiency = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '效率',
                    data: [85, 92, 88, 95, 90, 87, 93],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 212, 255, 0.2)'
                        },
                        ticks: {
                            color: '#00d4ff'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 212, 255, 0.2)'
                        },
                        ticks: {
                            color: '#00d4ff'
                        }
                    }
                }
            }
        });
    }

    // 更新所有图表
    updateAllCharts() {
        Object.keys(this.charts).forEach(chartName => {
            if (this.charts[chartName]) {
                this.updateChart(chartName);
            }
        });
    }

    // 更新指定图表
    updateChart(chartName) {
        const chart = this.charts[chartName];
        if (!chart) return;

        // 根据图表类型更新数据
        switch(chartName) {
            case 'yield':
                this.updateYieldChart();
                break;
            case 'efficiency':
                this.updateEfficiencyChart();
                break;
            default:
                chart.update();
        }
    }

    // 更新产量图表
    updateYieldChart() {
        const chart = this.charts.yield;
        if (chart) {
            // 生成新的随机数据
            const newData = chart.data.datasets[0].data.map(() => 
                Math.round((Math.random() * 100 + 100) * 10) / 10
            );
            chart.data.datasets[0].data = newData;
            chart.update();
        }
    }

    // 更新效率图表
    updateEfficiencyChart() {
        const chart = this.charts.efficiency;
        if (chart) {
            // 生成新的随机数据
            const newData = chart.data.datasets[0].data.map(() => 
                Math.round((Math.random() * 20 + 80) * 10) / 10
            );
            chart.data.datasets[0].data = newData;
            chart.update();
        }
    }

    // 初始化右侧面板生产数据图表
    initSideProductionChart() {
        const canvas = document.getElementById('production-chart');
        if (!canvas) {
            console.warn('右侧生产图表画布未找到');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // 生成模拟数据
        const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const productionData = [1200, 1350, 1180, 1420, 1380, 1250, 1300];

        this.charts.sideProduction = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '日产量 (吨)',
                    data: productionData,
                    backgroundColor: 'rgba(245, 196, 90, 0.6)',
                    borderColor: 'rgba(245, 196, 90, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(245, 196, 90, 0.2)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(245, 196, 90, 0.2)'
                        }
                    }
                }
            }
        });
    }

    // 初始化右侧面板效率趋势图表
    initEfficiencyTrendChart() {
        const canvas = document.getElementById('efficiency-trend-chart');
        if (!canvas) {
            console.warn('效率趋势图表画布未找到');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // 生成模拟数据
        const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        const efficiencyData = [75, 82, 88, 85, 90, 87];

        this.charts.efficiencyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '设备效率 (%)',
                    data: efficiencyData,
                    borderColor: 'rgba(245, 196, 90, 1)',
                    backgroundColor: 'rgba(245, 196, 90, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(245, 196, 90, 0.2)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(245, 196, 90, 0.2)'
                        }
                    }
                }
            }
        });
    }
}

// 创建全局实例
window.ChartsManager = new ChartsManager();

// 页面加载完成后初始化图表
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化以确保DOM完全加载
    setTimeout(() => {
        if (window.ChartsManager) {
            window.ChartsManager.init();
        }
    }, 500);
});