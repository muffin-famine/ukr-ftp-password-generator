function init() {
    document.getElementById("generateButton").addEventListener("click", function() {
        try {
            generate();
        } catch (e) {
            alert(e);
        }
        return false;
    });
}

function generate() {
    let rawUsers = parseUsers();
    let domain = document.forms["main_form"]["domain"].value;
    let genUsers = generateEmails(rawUsers, domain);

    if (genUsers.length > 0) {
        displayGeneratedInfo(genUsers);
    }
}

function parseUsers() {
    let lines = document.forms["main_form"]["users"].value.split("\n");
    let users = [];
    let i = 0;
    let badLines = [];
    let alertMessages = [];
    for (let line of lines) {
        let trimmedLine = line.trim();
        let unknowns = getUnknownTransliterate(trimmedLine.split("\t").slice(0,3).join("\t"));
        if (unknowns.length > 0) {
            badLines.push({
                line: trimmedLine,
                badSymbols: unknowns
            });
            continue;
        }
        if (trimmedLine.length > 0) {
            let userPrefs = trimmedLine.split("\t");
            if (userPrefs.length < 3) {
                alertMessages.push("Лінійка " + trimmedLine + " не містить повної інформації");
                continue;
            }
            users[i] = {
                group: userPrefs[0].trim(),
                lastName: userPrefs[1].trim(),
                firstName: userPrefs[2].trim(),
                plainText: trimmedLine
            };
            if (userPrefs[3]) {
                users[i].email = userPrefs[3].trim();
                if (userPrefs[4]) {
                    users[i].password = userPrefs[4].trim();
                } else {
                    alertMessages.push("Студент має існуючий імейл " + users[i].email + ", але не має пароля!");
                }
            }
            i++;
        }
    }
    if (alertMessages.length > 0) {
        alert(alertMessages.join("\r\n"));
        return [];
    }
    if (badLines.length > 0) {
        document.getElementById("badlinesroot").classList = "visible";
        for (let badLine of badLines) {
            document.getElementById("badlines").innerHTML += "<p>" + badLine.line + " <b>Символи: </b> " + badLine.badSymbols.join(", ") + "</p>"
        }
    } else {
        document.getElementById("badlinesroot").classList = "hidden";
        document.getElementById("badlines").innerHTML = "";
    }
    return users;
}

function generateEmails(rawUsers, domain) {
    let genUsers = [];
    let allUsernames = [];
    // First process everyone that already have emails
    for (let rawUser of rawUsers) {
        if (rawUser.email) {
            rawUser.doNotTouch = true;
            rawUser.username = rawUser.email.split('@')[0];
            allUsernames.push(rawUser.username);
            genUsers.push(rawUser);
        }
    }

    // Then process new users
    for (let rawUser of rawUsers) {
        if (!rawUser.email) {
            let username = transliterate(rawUser.group) + "." + transliterate(rawUser.lastName) + "." + transliterate(rawUser.firstName[0]);
            username = username.toLowerCase();
            let arrayCopy = rawUsers.slice();
            username = generateUniqueUsername(allUsernames, username);
            rawUser.username = username;
            allUsernames.push(rawUser.username);
            rawUser.password = randPassword(4,3,1,2);
            rawUser.email = username + "@" + domain;
            genUsers.push(rawUser);
        }
    }

    // Double-check. Перевіряємо на однакові юзернейми знову
    let alertMessages = [];
    for (var i=0; i<genUsers.length-1; i++) {
        for (var j=i+1; j<genUsers.length; j++) {
            if (genUsers[i].email == genUsers[j].email) {
                alertMessages.push("Знайдено кілька однакових імейлів: " + genUsers[i].email);
            }
        }
    }
    if (alertMessages.length > 0) {
        alert(alertMessages.join("\r\n"));
        return [];
    }
    return genUsers;
}

function generateUniqueUsername(allUsernames, username) {
    if (allUsernames.indexOf(username) === -1) {
        return username;
    }
    let uniqueUsername;
    for (let i=2; i<100; i++) {
        uniqueUsername = username + i;
        if (allUsernames.indexOf(uniqueUsername) === -1) {
            return uniqueUsername;
        }
    }
    return username;
}

let translitMap = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '0': '0',
    'зг' : 'zgh',
    'Зг' : 'Zgh',
    'А':'A',
    'а':'a',
    'Б':'B',
    'б':'b',
    'В':'V',
    'в':'v',
    'Г':'H',
    'г':'h',
    'Ґ':'G',
    'ґ':'g',
    'Д':'D',
    'д':'d',
    'Е':'E',
    'е':'e',
    'Є':'Ye',
    'є':'ie',
    'Ж':'Zh',
    'ж':'zh',
    'З':'Z',
    'з':'z',
    'И':'Y',
    'и':'y',
    'І':'I',
    'і':'i',
    'Ї':'Yi',
    'ї':'i',
    'Й':'Y',
    'й':'i',
    'К':'K',
    'к':'k',
    'Л':'L',
    'л':'l',
    'М':'M',
    'м':'m',
    'Н':'N',
    'н':'n',
    'О':'O',
    'о':'o',
    'П':'P',
    'п':'p',
    'Р':'R',
    'р':'r',
    'С':'S',
    'с':'s',
    'Т':'T',
    'т':'t',
    'У':'U',
    'у':'u',
    'Ф':'F',
    'ф':'f',
    'Х':'Kh',
    'х':'kh',
    'Ц':'Ts',
    'ц':'ts',
    'Ч':'Ch',
    'ч':'ch',
    'Ш':'Sh',
    'ш':'sh',
    'Щ':'Shch',
    'щ':'shch',
    'ь':'',
    'Ю':'Yu',
    'ю':'iu',
    'Я':'Ya',
    'я':'ia',
    '’': '',
    '`': '',
    '\'': '',
    ' ': '',
    '-': ''
}

function transliterate(str) {
    let result = '';
    for (var i=0; i<str.length; i++) {
        let translated = translitMap[str[i]];
        if (translated !== '' && !translated) {
            alert("Символа " + str[i] + " немає в мапі транслітерації, тому він додасться без змін.")
            translated = str[i];
        }
        result += translated;
    }
    return result.toLowerCase();
}

function getUnknownTransliterate(str) {
    let unknowns = [];
    for (var i=0; i<str.length; i++) {
        let translated = translitMap[str[i]];
        if (translated !== '' && !translated && str[i] !== '\t') {
            unknowns.push(str[i]);
        }
    }
    return unknowns;
}

function randPassword(letters, numbers, specials, either) {
    var chars = [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", // letters
        "0123456789", // numbers
        "!@#$%^&*()_+", // special characters
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" // either
    ];

    return [letters, numbers, specials, either].map(function(len, i) {
        return Array(len).fill(chars[i]).map(function(x) {
            return x[Math.floor(Math.random() * x.length)];
        }).join('');
    }).concat().join('').split('').sort(function(){
        return 0.5-Math.random();
    }).join('')
}

function displayGeneratedInfo(genUsers) {
    let text = '';
    for (let genUser of genUsers) {
        text += genUser.group + '\t' + genUser.lastName + '\t' + genUser.firstName + '\t' + genUser.email + '\t' + genUser.password + '\n';
    }
    document.getElementById("generatedUsernames").value = text;

    document.getElementById("results").classList = "visible";
}

window.onload = () => {
    init();
}