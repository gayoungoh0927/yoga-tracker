document.addEventListener('DOMContentLoaded', () => {
    const monthYear = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const attendanceCount = document.getElementById('attendance-count');
    const totalDays = document.getElementById('total-days');
    const modal = document.getElementById('emoji-modal');
    const closeButton = document.querySelector('.close-button');
    const emojiSelection = document.querySelector('.emoji-selection');
    const monthlyFeeInput = document.getElementById('monthly-fee');
    const saveFeeButton = document.getElementById('save-fee');
    const costPerSession = document.getElementById('cost-per-session');
    const editFeeButton = document.getElementById('edit-fee-button');
    const feeInputContainer = document.getElementById('fee-input-container');
    const removeAttendanceButton = document.getElementById('remove-attendance');

    let currentDate = new Date();
    let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};
    let monthlyFee = localStorage.getItem('monthlyFee') || 0;
    monthlyFeeInput.value = monthlyFee > 0 ? monthlyFee : '';
    if (monthlyFee <= 0) {
        feeInputContainer.style.display = 'block';
    }
    let selectedDateString = null;

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthYear.textContent = `${year}년 ${month + 1}월`;
        totalDays.textContent = daysInMonth;
        calendarGrid.innerHTML = '';

        // 월요일 시작
        const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
        dayNames.forEach(name => {
            const dayNameCell = document.createElement('div');
            dayNameCell.classList.add('day-name');
            dayNameCell.textContent = name;
            calendarGrid.appendChild(dayNameCell);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const emptyCells = (firstDay === 0) ? 6 : firstDay - 1;
        for (let i = 0; i < emptyCells; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            const dayNumber = document.createElement('span');
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            const dateString = `${year}-${month + 1}-${day}`;
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayCell.classList.add('today');
            }
            if (attendanceData[dateString]) {
                const emojiDisplay = document.createElement('div');
                emojiDisplay.classList.add('emoji-display');
                emojiDisplay.textContent = attendanceData[dateString];
                dayCell.appendChild(emojiDisplay);
                dayCell.classList.add('attended');
            }
            dayCell.addEventListener('click', () => {
                selectedDateString = dateString;
                if (attendanceData[dateString]) {
                    removeAttendanceButton.style.display = 'block';
                } else {
                    removeAttendanceButton.style.display = 'none';
                }
                modal.style.display = 'block';
            });
            calendarGrid.appendChild(dayCell);
        }
        updateAttendanceCount();
        updateCostPerSession();
    }

    function updateAttendanceCount() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        let count = 0;
        for (const dateString in attendanceData) {
            const [y, m] = dateString.split('-').map(Number);
            if (y === year && m === month + 1) {
                count++;
            }
        }
        attendanceCount.textContent = count;
    }

    function updateCostPerSession() {
        const currentMonthAttendance = parseInt(attendanceCount.textContent) || 0;
        const fee = parseInt(monthlyFee) || 0;
        if (fee > 0 && currentMonthAttendance > 0) {
            const cost = Math.floor(fee / currentMonthAttendance);
            costPerSession.textContent = cost.toLocaleString();
        } else {
            costPerSession.textContent = '0';
        }
    }

    saveFeeButton.addEventListener('click', () => {
        const newFee = parseInt(monthlyFeeInput.value) || 0;
        monthlyFee = newFee;
        localStorage.setItem('monthlyFee', newFee);
        updateCostPerSession();
        feeInputContainer.style.display = 'none';
        alert('수강료가 저장되었습니다.');
    });

    editFeeButton.addEventListener('click', () => {
        const isHidden = feeInputContainer.style.display === 'none';
        feeInputContainer.style.display = isHidden ? 'block' : 'none';
    });

    removeAttendanceButton.addEventListener('click', () => {
        if (selectedDateString && attendanceData[selectedDateString]) {
            delete attendanceData[selectedDateString];
            localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
            modal.style.display = 'none';
            renderCalendar();
        }
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    emojiSelection.addEventListener('click', (event) => {
        if (event.target.classList.contains('emoji')) {
            if (!attendanceData[selectedDateString]) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }
            const selectedEmoji = event.target.textContent;
            attendanceData[selectedDateString] = selectedEmoji;
            localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
            modal.style.display = 'none';
            renderCalendar();
        }
    });

    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});