let bloodSugarChart, cholesterolChart, uricAcidChart;

document.addEventListener('DOMContentLoaded', () => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#f9fafb',
        borderColor: '#ccc',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: 'Inter'
          }
        },
        grid: {
          color: '#e5e7eb'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Inter'
          }
        },
        grid: {
          color: '#f1f5f9'
        }
      }
    }
  };

  function createLineChart(ctxId, label, borderColor, bgColor) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: label,
          data: [],
          borderColor,
          backgroundColor: bgColor,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: chartOptions
    });
  }

  // Inisialisasi grafik kosong
  bloodSugarChart = createLineChart(
    'bloodSugarChart',
    'Blood Sugar (mg/dL)',
    '#22c55e',
    'rgba(34,197,94,0.1)'
  );

  cholesterolChart = createLineChart(
    'cholesterolChart',
    'Cholesterol (mg/dL)',
    '#3b82f6',
    'rgba(59,130,246,0.1)'
  );

  uricAcidChart = createLineChart(
    'uricAcidChart',
    'Uric Acid (mg/dL)',
    '#ef4444',
    'rgba(239,68,68,0.1)'
  );
});

// Fungsi untuk update chart dengan data baru
function updateCharts(newData) {
  if (!newData || !Array.isArray(newData) || newData.length === 0) return;

  const labels = newData.map(d => {
    try {
      return new Date(d.tanggal).toLocaleDateString('id-ID');
    } catch {
      return '';
    }
  });

  const safeMap = (arr, key) => arr.map(d => Number(d[key]) || 0);

  const bloodSugarData = safeMap(newData, 'blood_sugar');
  const cholesterolData = safeMap(newData, 'cholesterol');
  const uricAcidData = safeMap(newData, 'uric_acid');

  if (bloodSugarChart) {
    bloodSugarChart.data.labels = labels;
    bloodSugarChart.data.datasets[0].data = bloodSugarData;
    bloodSugarChart.update();
  }

  if (cholesterolChart) {
    cholesterolChart.data.labels = labels;
    cholesterolChart.data.datasets[0].data = cholesterolData;
    cholesterolChart.update();
  }

  if (uricAcidChart) {
    uricAcidChart.data.labels = labels;
    uricAcidChart.data.datasets[0].data = uricAcidData;
    uricAcidChart.update();
  }
}