$(document).ready(function () {

    var questions = [];
    var answers = [];
    var qNum = 0;
    var correctAnswers = 0;
    var incorrectAnswers = 0;
    var intervalId;
    const categoriesURL = 'https://opentdb.com/api_category.php';
    //Queries The Open Trivia DB API
    const getData = async (url) => {
        const json = await fetch(url)
            .then(response => response.json());
        return json;
    }
    //Builds the list of available categories by calling the API.  Each category has an id property.
    getData(categoriesURL).then(response => {
        let cat = response.trivia_categories;
        cat.forEach(element => {
            $('#container').append(`<button class="categories" id="${element.id}">${element.name}</button>`);
        });
    });
    //Listener for category selection calls API to fetch Q:A pairs and calls function to display first question
    $('body').on('click', '.categories', function () {
        getData(`https://opentdb.com/api.php?amount=10&category=${this.id}&type=multiple`)
            .then(response => {
                questions = response.results;
                showQ(qNum);
            })
    })
    //Sets up 30 second question timer and displays the question and list of answers. 
    //The answers are constructed into an array from two properties on the response and sent to a randomizer function
    const showQ = (num) => {
        let timeLeft = 30;
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

    }
    //Listener for the selected answer and calls the showAnswer function based on whether the user was right or wrong
    $('body').on('click', '.answer', function () {
        $(this).text() === decodeHTML(questions[qNum].correct_answer) ? showAnswer(true) : showAnswer(false);
    })
    //Displays the response based on whether user was correct or not.  Automatically advances to next question after 5 seconds.
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
            qNum < 10 ? showQ(qNum) : $('#container').html(`<h2>Game Over</h2><p>Correct Answers: ${correctAnswers}</p><p>Incorrect Answers: ${incorrectAnswers}</p>`);
        }, 5000)
    }
    //Shuffles the "Correct Answer" with the array of incorrect answers
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
    //Some answers have escaped HTML characters (such as &amp;). This function allows for straight
    //comparison of the answers against the user selection.
    const decodeHTML = (str) => {
        let txt = document.createElement('div');
        txt.innerHTML = str;
        return txt.textContent;
    }
})
