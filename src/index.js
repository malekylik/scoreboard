(async () => {
    const getUserInfo = (input = []) => {
        const usersInfo = {};

        input.forEach(({ uid, displayName }) => {
            usersInfo[uid] = {
                name: displayName
            };
        });

        return usersInfo;
    };

    const getPuzzlesUnfo = (input = {}, usersInfo = []) => {
        const puzzlesInfo = [];

        input.rounds.forEach((e, i) => {
            puzzlesInfo.push({
                name: input.puzzles[i].name,
                timeLimit: input.puzzles[i].options.timeLimit["$numberLong"],
                results: e.solutions,
            });
        });

       return puzzlesInfo;
    };

    const drawHeader = (puzzlesInfo = []) => {
        const tableHeadRow = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.innerText = 'user name:';

        const tdComparison = document.createElement('td');
        tdComparison.innerText = 'Comparison';

        const tdPuzzlesName = [];

        puzzlesInfo.forEach(({ name }) => {
            const tdpuzzleName = document.createElement('td');
            tdpuzzleName.innerText = name;

            tdPuzzlesName.push(tdpuzzleName);
        });

        const tdTime = document.createElement('td');
        tdTime.innerText = 'total time:';

        tableHeadRow.appendChild(tdName);

        tdPuzzlesName.forEach((e) => {
            tableHeadRow.appendChild(e);
        });

        tableHeadRow.appendChild(tdTime);

        tableHeadRow.appendChild(tdComparison);

        tableHead.appendChild(tableHeadRow);
    };

    const drawBody = (usersInfo = {}, puzzlesInfo = []) => {
        const keys = Object.keys(usersInfo);

        const tableRows = [];

        let count = 0;

        for (let i = 0; i < keys.length; i++) {
            count += 1;

            const tableBodyRow = document.createElement('tr');

            const tdName = document.createElement('td');
            tdName.innerText = `${count}: ${usersInfo[keys[i]].name}`;

            const tableBodyRowPuzzles = [];

            let totalAmount = 0;

            puzzlesInfo.forEach((e) => {
                const puzzleInfo = document.createElement('td');

                if (e.results[keys[i]] != undefined) {
                    let numberLong = parseInt(e.results[keys[i]].time['$numberLong'], 10);

                    if (numberLong > e.timeLimit) {
                        numberLong = e.timeLimit;
                    }
                    puzzleInfo.innerText = numberLong;

                    puzzleInfo.dataset.answer = `${e.results[keys[i]].correct}: ${e.results[keys[i]].code}`;
                } else {
                    puzzleInfo.innerText = e.timeLimit;
                    puzzleInfo.dataset.answer = 'no answer';
                }


                totalAmount += parseInt(puzzleInfo.innerText, 10);

                tableBodyRowPuzzles.push(puzzleInfo);
            });

            const tdTotalTime = document.createElement('td');
            tdTotalTime.innerText = String(totalAmount);

            tableBodyRow.appendChild(tdName);

            tableBodyRowPuzzles.forEach((e) => {
                tableBodyRow.appendChild(e);
            });

            const checkBoxTd = document.createElement('td');
            const checkBox = document.createElement('input');
            checkBox.type = 'checkBox';

            checkBoxTd.appendChild(checkBox);
            tableBodyRow.appendChild(tdTotalTime);
            tableBodyRow.appendChild(checkBoxTd);

            tableRows.push(tableBodyRow);
        }

        tableRows.forEach((e) => {
            tableBody.appendChild(e);
        });
    };

    const createTooltip = (data = '', position = {}) => {
        lastToolTip = document.createElement('div');
        lastToolTip.classList.add('tooltip');
        lastToolTip.innerText = data;

        lastToolTip.style.top = 0 + 'px';
        lastToolTip.style.left = position.left;
        lastToolTip.style.visibility = 'hidden';
        
        document.body.appendChild(lastToolTip);

        const toolTipHeight = lastToolTip.getBoundingClientRect().height;

        if (position.top > toolTipHeight) {
            lastToolTip.style.top = document.body.scrollTop + position.top - 5 - lastToolTip.getBoundingClientRect().height + 'px';
        } else {
            lastToolTip.style.top = document.body.scrollTop + position.top + 5 + lastToolTip.getBoundingClientRect().height + 'px'
        }
       
        lastToolTip.style.visibility = 'visible';
    };

    const changeSession = (e) => {
        puzzlesInfo = getPuzzlesUnfo(sessionsJSON[e.target.dataset.name], usersInfo);

        while(tableHead.children.length !== 0) {
            tableHead.removeChild(tableHead.children[0])
        }

        while(tableBody.children.length !== 0) {
            tableBody.removeChild(tableBody.children[0])
        }

        checkedRows = [];

        colors.forEach((e) => {
            e.isUsed = false
        });

        drawHeader(puzzlesInfo);
        drawBody(usersInfo, puzzlesInfo);

        while (chart.data.labels != 0) {
            chart.data.labels.pop();
        }

        while (chart.data.datasets != 0) {
            chart.data.datasets.pop();
        }

        chart.data.labels = puzzlesInfo.map(({ name }) => name);

        chart.update();
    };

    const createChart = (canvas, puzzlesInfo = []) => {
        return new Chart(ctx, { 
            type: 'line',
            data: {
                labels: puzzlesInfo.map(({ name }) => name),
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                        }
                    }]
                }, 
                tooltips: {
                    mode: 'x',
                },
                legend: {
                    display: true,
                    position: 'bottom',
                }
            },
        });
    };

    const updateChart = (chart, name, times, color) => {
        chart.data.datasets.push({
            label: name,
            data: times,
            backgroundColor: [color],
            borderColor: [color],
            pointBorderColor: color,
            pointBackgroundColor: color,
            borderWidth: 1,
            fill: false,
        });

        chart.update();
    };

    const removeChartItem = (chart, index) => {
        chart.data.datasets.splice(index, 1);

        chart.update();
    };

    const colors = [
        {
            color: '#ff0000',
            isUsed: false
        },
        {
            color: '#00ff00',
            isUsed: false
        },
        {
            color: '#0000ff',
            isUsed: false
        },
        {
            color: '#ffd700',
            isUsed: false
        },
        {
            color: '#808080',
            isUsed: false
        },
        {
            color: '#3CB371',
            isUsed: false
        },
        {
            color: '#ffb6c1',
            isUsed: false
        },
        {
            color: '#66CDAA',
            isUsed: false
        },
        {
            color: '#da70d6',
            isUsed: false
        },
        {
            color: '#cd853f',
            isUsed: false
        },
    ];

    let checkedRows = [];

    const ctx = document.body.getElementsByClassName('chart')[0].getContext('2d');

    let lastToolTip = null;

    let radios = document.querySelectorAll('input[type=radio]');

    radios.forEach((e) => {
        e.addEventListener('click', changeSession);
    });

    let [user, sessions] = await Promise.all([fetch('/src/dumps/users.json'), fetch('/src/dumps/sessions.json')]);
    let [userJSON, sessionsJSON] = await Promise.all([user.json(), sessions.json()]);

    let usersInfo = getUserInfo(userJSON);
    let puzzlesInfo = getPuzzlesUnfo(sessionsJSON.rsschool, usersInfo);

    drawHeader(puzzlesInfo);
    drawBody(usersInfo, puzzlesInfo);
    let chart = createChart(ctx, puzzlesInfo);

    tableBody.addEventListener('mouseover', (e) => {
        let td = e.target;

        while (td != null && td.localName != 'td') {
            td = td.parentElement;
        }

        if (td === null) {
            return;
        }

        const answer = td.dataset.answer;

        if (answer != undefined && lastToolTip === null) {
            createTooltip(answer, td.getBoundingClientRect());
        }
    });

    tableBody.addEventListener('mouseout', () => {
        if (lastToolTip !== null) {
            document.body.removeChild(lastToolTip);

            lastToolTip = null;
        }
    });

    tableBody.addEventListener('change', (e) => {
        let tr = e.target;

        while (tr != null && tr.localName != 'tr') {
            tr = tr.parentElement;
        }

        if (e.target.checked) {
            if (checkedRows.length < 10) {
                const colorIndex = colors.findIndex((e) => !e.isUsed);
                colors[colorIndex].isUsed = true;

                checkedRows.push({ 
                        tr,
                        color: colors[colorIndex].color
                    });

                updateChart(
                    chart,
                    tr.cells[0].innerText,
                    Array.prototype.slice.call(tr.cells, 1, tr.cells.length - 2).map(({ innerText }) => innerText),
                    colors[colorIndex].color,
                );
            } else {
                e.target.checked = false;
            }
        } else {
            const index = checkedRows.findIndex((e) => e.tr === tr);
            colors.find((e) => e.color === checkedRows[index].color).isUsed = false;

            removeChartItem(chart, index);

            checkedRows.splice(index, 1);
        }
    });
})();

