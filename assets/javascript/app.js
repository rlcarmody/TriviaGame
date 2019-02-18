$(document).ready(function () {
    var questions = [];
    var answers = [];
    var qNum = 0;
    var correctAnswers = 0;
    var incorrectAnswers = 0;
    var intervalId;
    var timeLeft = 30;
    const content = document.getElementById('container');
    const categoriesURL = 'https://opentdb.com/api_category.php';
    const getData = async (url) => {
        const json = await fetch(url)
            .then(response => response.json());
        return json;
    }
    getData(categoriesURL).then(response => {
        let cat = response.trivia_categories;
        cat.forEach(element => {
            content.innerHTML += `<button class="categories" id="${element.id}">${element.name}</button>`;
        });
    });
    $('body').on('click', '.categories', function () {
        getData(`https://opentdb.com/api.php?amount=10&category=${this.id}&type=multiple`).then(response => {
            questions = response.results;
            showQ(qNum);
        })
    })
    const showQ = (num) => {
        timeLeft = 30;
        $('#timer').text(timeLeft).attr('value', Math.max(timeLeft, 10));
        intervalId = setInterval(function () {
            timeLeft--;
            $('#timer').text(timeLeft).attr('value', Math.max(timeLeft, 10));
            if (timeLeft < 1) {
                showAnswer('timeout');
            }
        }, 1000)
        answers = [];
        answers.push(questions[num].correct_answer);
        for (let index in questions[num].incorrect_answers) {
            answers.push(questions[num].incorrect_answers[index]);
        }
        answers = randomize(answers);
        $('#container').html(`<h2>${qNum + 1}. ${questions[num].question}</h2>`);
        $('#container').append('<ul id="answers"></ul>')
        for (let index in answers) {
            $('#answers').append(`<li class="answer">${answers[index]}</li>`)
        }
        console.log(answers);
     
    }
    $('body').on('click', '.answer', function () {
        console.log($(this).html())
        if ($(this).text() === decodeHTML(questions[qNum].correct_answer)) {
            showAnswer(true);
        } else {
            showAnswer(false);
        }

    })
    const showAnswer = (status) => {
        clearInterval(intervalId);
        switch (status) {
            case true:
                correctAnswers++;
                $('#container').html(`<h2>Correct!</h2>`);
                break;
            case false:
                incorrectAnswers++;
                $('#container').html(`<h2>Incorrect</h2><p>The correct answer is ${questions[qNum].correct_answer}</p>`);
                break;
            case 'timeout':
                incorrectAnswers++;
                $('#container').html(`<h2>Time\'s Up!</h2><p>The correct answer is ${questions[qNum].correct_answer}</p>`);
                break;
        }
        qNum++
        setTimeout(function () {
            if (qNum < 10) {
                showQ(qNum);
            }
            else {
                $('#container').html(`<h2>Game Over</h2><p>Correct Answers: ${correctAnswers}</p><p>Incorrect Answers: ${incorrectAnswers}</p>`);
            }
        }, 5000)
    }
    const randomize = (arr) => {
        let currentIndex = arr.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = arr[currentIndex];
            arr[currentIndex] = arr[randomIndex];
            arr[randomIndex] = temporaryValue;
        }
        return arr;
    }
    const decodeHTML = (str) => {
        var txt = document.createElement('div');
        txt.innerHTML = str;
        return txt.textContent;
    }
})
