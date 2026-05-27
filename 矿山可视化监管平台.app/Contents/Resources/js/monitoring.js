// 监控管理器
class MonitoringManager {
    constructor() {
        this.sensors = [];
        this.updateInterval = null;
        this.isInitialized = false;
        this.alertThresholds = {
            temperature: { min: 15, max: 35, warning: 30 },
            humidity: { min: 30, max: 90, warning: 80 },
            gas: { min: 0, max: 0.1, warning: 0.05 },
            pressure: { min: 95, max: 105, warning: 102 },
            vibration: { min: 0, max: 20, warning: 15 },
            noise: { min: 60, max: 90, warning: 85 }
        };
        
        this.init();
    }

    // 初始化监控管理器
    init() {
        this.setupSensorDisplay();
        this.startRealTimeMonitoring();
        this.isInitialized = true;
        console.log('监控管理器初始化完成');
    }

    // 设置传感器显示
    setupSensorDisplay() {
        this.createSensorCards();
        this.setupSensorFilters();
        this.setupAlertHandlers();
    }

    // 创建传感器卡片
    createSensorCards() {
        const sensorGrid = document.querySelector('.sensor-grid');
        if (!sensorGrid) {
            console.warn('传感器网格容器未找到');
            return;
        }

        // 清空现有内容
        sensorGrid.innerHTML = '';

        // 获取传感器数据
        if (window.DataManager) {
            const monitoringData = window.DataManager.getData('monitoring');
            if (monitoringData && monitoringData.sensors) {
                this.sensors = monitoringData.sensors;
                this.renderSensorCards();
            }
        }
    }

    // 渲染传感器卡片
    renderSensorCards() {
        const sensorGrid = document.querySelector('.sensor-grid');
        if (!sensorGrid) return;

        sensorGrid.innerHTML = '';

        this.sensors.forEach(sensor => {
            const sensorCard = this.createSensorCard(sensor);
            sensorGrid.appendChild(sensorCard);
        });
    }

    // 创建单个传感器卡片
    createSensorCard(sensor) {
        const card = document.createElement('div');
        card.className = `sensor-card ${sensor.status}`;
        card.dataset.sensorId = sensor.id;
        card.dataset.sensorType = sensor.type;

        const statusIcon = this.getStatusIcon(sensor.status);
        const statusColor = this.getStatusColor(sensor.status);

        card.innerHTML = `
            <div class="sensor-header">
                <div class="sensor-icon ${sensor.type}">
                    ${this.getSensorIcon(sensor.type)}
                </div>
                <div class="sensor-status ${sensor.status}">
                    ${statusIcon}
                </div>
            </div>
            <div class="sensor-info">
                <h4 class="sensor-name">${sensor.name}</h4>
                <div class="sensor-location">${sensor.location}</div>
            </div>
            <div class="sensor-value">
                <span class="value">${sensor.value}</span>
                <span class="unit">${sensor.unit}</span>
            </div>
            <div class="sensor-threshold">
                <div class="threshold-bar">
                    <div class="threshold-fill" style="width: ${this.calculateThresholdPercentage(sensor)}%; background-color: ${statusColor}"></div>
                </div>
                <div class="threshold-labels">
                    <span class="min">${sensor.threshold.min}</span>
                    <span class="max">${sensor.threshold.max}</span>
                </div>
            </div>
            <div class="sensor-meta">
                <div class="last-update">
                    更新时间: ${new Date(sensor.lastUpdate).toLocaleTimeString('zh-CN')}
                </div>
            </div>
        `;

        // 添加点击事件
        card.addEventListener('click', () => {
            this.showSensorDetails(sensor);
        });

        return card;
    }

    // 获取传感器图标
    getSensorIcon(type) {
        const icons = {
            temperature: '🌡️',
            humidity: '💧',
            gas: '💨',
            pressure: '📊',
            vibration: '📳',
            noise: '🔊'
        };
        return icons[type] || '📡';
    }

    // 获取状态图标
    getStatusIcon(status) {
        const icons = {
            normal: '✅',
            warning: '⚠️',
            error: '❌',
            offline: '⚫'
        };
        return icons[status] || '❓';
    }

    // 获取状态颜色
    getStatusColor(status) {
        const colors = {
            normal: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
            offline: '#9E9E9E'
        };
        return colors[status] || '#9E9E9E';
    }

    // 计算阈值百分比
    calculateThresholdPercentage(sensor) {
        const { min, max } = sensor.threshold;
        const range = max - min;
        const valueInRange = Math.max(0, Math.min(range, sensor.value - min));
        return (valueInRange / range) * 100;
    }

    // 显示传感器详情
    showSensorDetails(sensor) {
        const modal = this.createSensorModal(sensor);
        document.body.appendChild(modal);
        
        // 显示模态框
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    // 创建传感器模态框
    createSensorModal(sensor) {
        const modal = document.createElement('div');
        modal.className = 'sensor-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${sensor.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="sensor-detail-grid">
                        <div class="detail-item">
                            <label>当前值:</label>
                            <span class="current-value">${sensor.value} ${sensor.unit}</span>
                        </div>
                        <div class="detail-item">
                            <label>状态:</label>
                            <span class="status ${sensor.status}">${this.getStatusText(sensor.status)}</span>
                        </div>
                        <div class="detail-item">
                            <label>位置:</label>
                            <span>${sensor.location}</span>
                        </div>
                        <div class="detail-item">
                            <label>类型:</label>
                            <span>${this.getSensorTypeText(sensor.type)}</span>
                        </div>
                        <div class="detail-item">
                            <label>最小阈值:</label>
                            <span>${sensor.threshold.min} ${sensor.unit}</span>
                        </div>
                        <div class="detail-item">
                            <label>最大阈值:</label>
                            <span>${sensor.threshold.max} ${sensor.unit}</span>
                        </div>
                        <div class="detail-item">
                            <label>警告阈值:</label>
                            <span>${sensor.threshold.warning} ${sensor.unit}</span>
                        </div>
                        <div class="detail-item">
                            <label>最后更新:</label>
                            <span>${new Date(sensor.lastUpdate).toLocaleString('zh-CN')}</span>
                        </div>
                    </div>
                    <div class="sensor-history">
                        <h4>历史数据</h4>
                        <canvas id="sensorHistoryChart-${sensor.id}"></canvas>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-close">关闭</button>
                    <button class="btn-primary" onclick="window.MonitoringManager.calibrateSensor('${sensor.id}')">校准传感器</button>
                </div>
            </div>
        `;

        // 添加关闭事件
        const closeButtons = modal.querySelectorAll('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeSensorModal(modal);
            });
        });
        
        overlay.addEventListener('click', () => {
            this.closeSensorModal(modal);
        });

        // 创建历史数据图表
        setTimeout(() => {
            this.createSensorHistoryChart(sensor);
        }, 100);

        return modal;
    }

    // 关闭传感器模态框
    closeSensorModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // 创建传感器历史数据图表
    createSensorHistoryChart(sensor) {
        const canvas = document.getElementById(`sensorHistoryChart-${sensor.id}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const history = sensor.history || [];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map(h => new Date(h.timestamp).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })),
                datasets: [{
                    label: `${sensor.name} (${sensor.unit})`,
                    data: history.map(h => h.value),
                    borderColor: this.getStatusColor(sensor.status),
                    backgroundColor: this.getStatusColor(sensor.status) + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
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
                        display: true,
                        title: {
                            display: true,
                            text: '时间'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: sensor.unit
                        },
                        min: sensor.threshold.min,
                        max: sensor.threshold.max
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });
    }

    // 获取状态文本
    getStatusText(status) {
        const statusTexts = {
            normal: '正常',
            warning: '警告',
            error: '错误',
            offline: '离线'
        };
        return statusTexts[status] || '未知';
    }

    // 获取传感器类型文本
    getSensorTypeText(type) {
        const typeTexts = {
            temperature: '温度传感器',
            humidity: '湿度传感器',
            gas: '气体传感器',
            pressure: '压力传感器',
            vibration: '振动传感器',
            noise: '噪音传感器'
        };
        return typeTexts[type] || '未知传感器';
    }

    // 设置传感器过滤器
    setupSensorFilters() {
        const filterButtons = document.querySelectorAll('.sensor-filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                this.filterSensors(filterType);
                
                // 更新按钮状态
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    // 过滤传感器
    filterSensors(filterType) {
        const sensorCards = document.querySelectorAll('.sensor-card');
        
        sensorCards.forEach(card => {
            if (filterType === 'all') {
                card.style.display = 'block';
            } else if (filterType === 'status') {
                const status = card.classList.contains('normal') ? 'normal' : 
                             card.classList.contains('warning') ? 'warning' :
                             card.classList.contains('error') ? 'error' : 'offline';
                card.style.display = status !== 'normal' ? 'block' : 'none';
            } else {
                const sensorType = card.dataset.sensorType;
                card.style.display = sensorType === filterType ? 'block' : 'none';
            }
        });
    }

    // 设置报警处理器
    setupAlertHandlers() {
        // 监听数据更新事件
        document.addEventListener('dataUpdated', (event) => {
            this.handleDataUpdate(event.detail);
        });
    }

    // 处理数据更新
    handleDataUpdate(updateData) {
        if (updateData.data && updateData.data.monitoring) {
            this.sensors = updateData.data.monitoring.sensors;
            this.updateSensorDisplay();
            this.checkAlertConditions();
        }
    }

    // 更新传感器显示
    updateSensorDisplay() {
        const sensorCards = document.querySelectorAll('.sensor-card');
        
        sensorCards.forEach(card => {
            const sensorId = card.dataset.sensorId;
            const sensor = this.sensors.find(s => s.id === sensorId);
            
            if (sensor) {
                this.updateSensorCard(card, sensor);
            }
        });
    }

    // 更新传感器卡片
    updateSensorCard(card, sensor) {
        // 更新状态类
        card.className = `sensor-card ${sensor.status}`;
        
        // 更新数值
        const valueElement = card.querySelector('.value');
        if (valueElement) {
            valueElement.textContent = sensor.value;
        }
        
        // 更新状态图标
        const statusElement = card.querySelector('.sensor-status');
        if (statusElement) {
            statusElement.innerHTML = this.getStatusIcon(sensor.status);
            statusElement.className = `sensor-status ${sensor.status}`;
        }
        
        // 更新阈值条
        const thresholdFill = card.querySelector('.threshold-fill');
        if (thresholdFill) {
            const percentage = this.calculateThresholdPercentage(sensor);
            const color = this.getStatusColor(sensor.status);
            thresholdFill.style.width = `${percentage}%`;
            thresholdFill.style.backgroundColor = color;
        }
        
        // 更新时间
        const lastUpdateElement = card.querySelector('.last-update');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = `更新时间: ${new Date(sensor.lastUpdate).toLocaleTimeString('zh-CN')}`;
        }
    }

    // 检查报警条件
    checkAlertConditions() {
        this.sensors.forEach(sensor => {
            if (sensor.status === 'error' || sensor.status === 'warning') {
                this.triggerSensorAlert(sensor);
            }
        });
    }

    // 触发传感器报警
    triggerSensorAlert(sensor) {
        const alertMessage = this.generateAlertMessage(sensor);
        
        // 创建报警通知
        this.showAlertNotification(alertMessage, sensor.status);
        
        // 记录到报警系统
        if (window.DataManager) {
            // 这里可以添加到报警数据中
            console.log(`传感器报警: ${alertMessage}`);
        }
    }

    // 生成报警消息
    generateAlertMessage(sensor) {
        const sensorType = this.getSensorTypeText(sensor.type);
        const statusText = this.getStatusText(sensor.status);
        
        return `${sensor.location}的${sensorType}${statusText}: 当前值 ${sensor.value}${sensor.unit}`;
    }

    // 显示报警通知
    showAlertNotification(message, severity) {
        const notification = document.createElement('div');
        notification.className = `alert-notification ${severity}`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getStatusIcon(severity)}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">&times;</button>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            this.closeNotification(notification);
        }, 5000);
        
        // 手动关闭
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.closeNotification(notification);
        });
    }

    // 关闭通知
    closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // 校准传感器
    calibrateSensor(sensorId) {
        const sensor = this.sensors.find(s => s.id === sensorId);
        if (!sensor) {
            console.error(`传感器 ${sensorId} 未找到`);
            return;
        }
        
        // 模拟校准过程
        this.showCalibrationDialog(sensor);
    }

    // 显示校准对话框
    showCalibrationDialog(sensor) {
        const dialog = document.createElement('div');
        dialog.className = 'calibration-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>校准传感器: ${sensor.name}</h3>
                    <button class="dialog-close">&times;</button>
                </div>
                <div class="dialog-body">
                    <p>正在校准传感器，请稍候...</p>
                    <div class="calibration-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="progress-text">0%</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 显示对话框
        setTimeout(() => {
            dialog.classList.add('show');
        }, 10);
        
        // 模拟校准进度
        this.simulateCalibration(dialog, sensor);
        
        // 关闭事件
        const closeButton = dialog.querySelector('.dialog-close');
        closeButton.addEventListener('click', () => {
            this.closeCalibrationDialog(dialog);
        });
    }

    // 模拟校准过程
    simulateCalibration(dialog, sensor) {
        const progressFill = dialog.querySelector('.progress-fill');
        const progressText = dialog.querySelector('.progress-text');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // 校准完成
                setTimeout(() => {
                    this.completeCalibration(dialog, sensor);
                }, 500);
            }
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }, 200);
    }

    // 完成校准
    completeCalibration(dialog, sensor) {
        const dialogBody = dialog.querySelector('.dialog-body');
        dialogBody.innerHTML = `
            <div class="calibration-success">
                <div class="success-icon">✅</div>
                <p>传感器校准完成！</p>
                <div class="calibration-results">
                    <div class="result-item">
                        <label>校准前:</label>
                        <span>${sensor.value} ${sensor.unit}</span>
                    </div>
                    <div class="result-item">
                        <label>校准后:</label>
                        <span>${(sensor.value * (0.95 + Math.random() * 0.1)).toFixed(2)} ${sensor.unit}</span>
                    </div>
                </div>
                <button class="btn-primary" onclick="window.MonitoringManager.closeCalibrationDialog(this.closest('.calibration-dialog'))">确定</button>
            </div>
        `;
    }

    // 关闭校准对话框
    closeCalibrationDialog(dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        }, 300);
    }

    // 启动实时监控
    startRealTimeMonitoring() {
        // 每5秒更新一次传感器数据
        this.updateInterval = setInterval(() => {
            this.updateSensorData();
        }, 5000);
        
        console.log('实时监控已启动');
    }

    // 更新传感器数据
    updateSensorData() {
        if (window.DataManager) {
            const monitoringData = window.DataManager.getData('monitoring');
            if (monitoringData && monitoringData.sensors) {
                this.sensors = monitoringData.sensors;
                this.updateSensorDisplay();
            }
        }
    }

    // 停止实时监控
    stopRealTimeMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('实时监控已停止');
    }

    // 导出监控数据
    exportMonitoringData() {
        const data = {
            timestamp: new Date().toISOString(),
            sensors: this.sensors,
            summary: this.generateSummaryReport()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `monitoring-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // 生成汇总报告
    generateSummaryReport() {
        const total = this.sensors.length;
        const normal = this.sensors.filter(s => s.status === 'normal').length;
        const warning = this.sensors.filter(s => s.status === 'warning').length;
        const error = this.sensors.filter(s => s.status === 'error').length;
        const offline = this.sensors.filter(s => s.status === 'offline').length;
        
        return {
            total,
            normal,
            warning,
            error,
            offline,
            healthScore: Math.round((normal / total) * 100)
        };
    }

    // 销毁监控管理器
    destroy() {
        this.stopRealTimeMonitoring();
        this.sensors = [];
        this.isInitialized = false;
        console.log('监控管理器已销毁');
    }
}

// 创建全局实例
window.MonitoringManager = new MonitoringManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化以确保其他组件已加载
    setTimeout(() => {
        if (window.MonitoringManager && !window.MonitoringManager.isInitialized) {
            window.MonitoringManager.init();
        }
    }, 1000);
});