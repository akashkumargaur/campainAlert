// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
});

// Chart.js Configuration
const ctx = document.getElementById('performanceChart').getContext('2d');

// Sample data for the chart
const dates = [];
const interactions = [];
const avgCpc = [];

// Generate sample data for 30 days
for (let i = 0; i < 30; i++) {
    const date = new Date(2025, 7, 31); // Aug 31, 2025
    date.setDate(date.getDate() + i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Generate realistic-looking data
    interactions.push(Math.floor(200 + Math.random() * 100 + Math.sin(i / 5) * 50));
    avgCpc.push((2.5 + Math.random() * 2 + Math.sin(i / 5) * 1.5).toFixed(2));
}

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [
            {
                label: 'Interactions',
                data: interactions,
                borderColor: '#2277D1',
                backgroundColor: 'rgba(34, 119, 209, 0.1)',
                yAxisID: 'y',
                tension: 0.4,
                fill: false
            },
            {
                label: 'Avg. CPC',
                data: avgCpc,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                enabled: true
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxTicksLimit: window.innerWidth < 576 ? 5 : window.innerWidth < 768 ? 7 : 10,
                    font: {
                        size: window.innerWidth < 576 ? 10 : 12
                    }
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                max: 500,
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    font: {
                        size: window.innerWidth < 576 ? 10 : 12
                    }
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                max: 10,
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    callback: function(value) {
                        return '$' + value.toFixed(2);
                    },
                    font: {
                        size: window.innerWidth < 576 ? 10 : 12
                    }
                }
            }
        }
    }
});

// Update chart colors based on theme
const updateChartTheme = () => {
    const isDark = body.classList.contains('dark-mode');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#FFFFFF' : '#343434';
    
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.scales.y1.ticks.color = textColor;
    chart.options.scales.y.grid.color = gridColor;
    chart.options.plugins.legend.labels.color = textColor;
    chart.update();
};

// Listen for theme changes
const observer = new MutationObserver(() => {
    updateChartTheme();
});

observer.observe(body, {
    attributes: true,
    attributeFilter: ['class']
});

// Initialize chart theme
updateChartTheme();

// Handle chart resize on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Update tick limits based on screen size
        const maxTicks = window.innerWidth < 576 ? 5 : window.innerWidth < 768 ? 7 : 10;
        const fontSize = window.innerWidth < 576 ? 10 : 12;
        
        chart.options.scales.x.ticks.maxTicksLimit = maxTicks;
        chart.options.scales.x.ticks.font = { size: fontSize };
        chart.options.scales.y.ticks.font = { size: fontSize };
        chart.options.scales.y1.ticks.font = { size: fontSize };
        
        chart.resize();
        chart.update('none'); // Update without animation for better performance
    }, 250);
});

// Table Sorting Functionality
let sortDirection = {};
const sortableHeaders = document.querySelectorAll('.sortable');

sortableHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const column = header.getAttribute('data-column');
        const table = document.getElementById('searchTermsTable');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr:not(.summary-row)'));
        
        // Toggle sort direction
        sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
        
        // Remove sort indicators from all headers
        document.querySelectorAll('.sort-indicator').forEach(ind => {
            ind.textContent = '';
        });
        
        // Add sort indicator to current header
        const indicator = header.querySelector('.sort-indicator') || document.createElement('span');
        if (!header.querySelector('.sort-indicator')) {
            indicator.className = 'sort-indicator';
            header.appendChild(indicator);
        }
        indicator.textContent = sortDirection[column] === 'asc' ? '↑' : '↓';
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = getCellValue(a, column);
            const bValue = getCellValue(b, column);
            
            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;
            
            return sortDirection[column] === 'asc' ? comparison : -comparison;
        });
        
        // Reorder rows in DOM
        rows.forEach(row => tbody.appendChild(row));
    });
});

function getCellValue(row, column) {
    const columnMap = {
        'search-term': 1,
        'match-type': 2,
        'impressions': 6,
        'interactions': 7,
        'interaction-rate': 8,
        'avg-cost': 9,
        'cost': 10
    };
    
    const cellIndex = columnMap[column];
    if (!cellIndex) return '';
    
    const cell = row.cells[cellIndex];
    if (!cell) return '';
    
    let text = cell.textContent.trim();
    
    // Parse numeric values
    if (column === 'impressions' || column === 'interactions') {
        return parseInt(text.replace(/,/g, '')) || 0;
    }
    
    if (column === 'interaction-rate') {
        return parseFloat(text.replace('%', '')) || 0;
    }
    
    if (column === 'avg-cost' || column === 'cost') {
        return parseFloat(text.replace('$', '').replace(/,/g, '')) || 0;
    }
    
    return text.toLowerCase();
}

// Checkbox Selection Functionality
const selectAllCheckbox = document.getElementById('selectAll');
const rowCheckboxes = document.querySelectorAll('.row-checkbox');
const actionBar = document.getElementById('actionBar');
const selectedCount = document.getElementById('selectedCount');

function updateSelection() {
    const checked = document.querySelectorAll('.row-checkbox:checked');
    const count = checked.length;
    
    selectedCount.textContent = `${count} selected`;
    
    if (count > 0) {
        actionBar.style.display = 'block';
    } else {
        actionBar.style.display = 'none';
    }
    
    // Update select all checkbox state
    selectAllCheckbox.indeterminate = count > 0 && count < rowCheckboxes.length;
    selectAllCheckbox.checked = count === rowCheckboxes.length;
}

selectAllCheckbox.addEventListener('change', () => {
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    updateSelection();
});

rowCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateSelection);
});

// Action Buttons
document.getElementById('addKeywordBtn').addEventListener('click', () => {
    const selected = document.querySelectorAll('.row-checkbox:checked');
    alert(`Adding ${selected.length} search term(s) as keyword(s)`);
});

document.getElementById('addNegativeKeywordBtn').addEventListener('click', () => {
    const selected = document.querySelectorAll('.row-checkbox:checked');
    alert(`Adding ${selected.length} search term(s) as negative keyword(s)`);
});

document.getElementById('closeActionBar').addEventListener('click', () => {
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    selectAllCheckbox.checked = false;
    updateSelection();
});

// Remove Cost Filter
function removeCostFilter() {
    const filter = document.getElementById('costFilter');
    filter.style.display = 'none';
}

// Date Navigation (simplified)
document.getElementById('prevDate').addEventListener('click', () => {
    // In a real implementation, this would update the date range
    console.log('Previous date range');
});

document.getElementById('nextDate').addEventListener('click', () => {
    // In a real implementation, this would update the date range
    console.log('Next date range');
});

// Initialize
updateSelection();

