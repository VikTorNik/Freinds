document.addEventListener("DOMContentLoaded", () => {

    let initFriends = {
        profileCard: {
            width: 270,
            height: 100,
        },
        gridFriends: {
            columns: 0,
            rows: 0,
        },
        randomuser: {
            base: 'https://randomuser.me/api/',
            get fullUrl() {
                return new URL(`${this.base}${this.search}`);
            },
            get search() {
                return `?results=${this.results}&gender=${this.gender}&nat=${this.nat}&inc=${this.inc}&exc=${this.exc}&noinfo`;
            },
            results: 1,
            gender: [],
            nat: [],
            inc: [],
            exc: ['login', 'registered', 'id'],
        },
        filter: {
            searchName: "",
            age: {
                min: 0,
                max: 0,
                currentMin: 0,
                currentMax: 0,
            }
        },
        sortCard: {
            nameABC: false,
            nameZYX: false,
            dobMinMax: false,
            dobMaxMin: false,
        },
        showCardInfo: {
            location: false,
            email: false,
            phone: false,
            cell: false,
        },
    };

    let dateFriendsServer = {};


    //* Фільтрація того, що завантуємо з сервера
    function filterBeforeServer() {
        initFriends.randomuser.results = document.querySelector('#check-totalFriend').value;

        const buttonGender = [];
        document.querySelector('#check-male').checked ? buttonGender.push('male') : false;
        document.querySelector('#check-female').checked ? buttonGender.push('female') : false;
        initFriends.randomuser.gender = buttonGender;

        const buttonNation = [];
        document.querySelector('#check-UA').checked ? buttonNation.push('UA') : false;
        document.querySelector('#check-ES').checked ? buttonNation.push('ES') : false;
        document.querySelector('#check-GB').checked ? buttonNation.push('GB') : false;
        document.querySelector('#check-NO').checked ? buttonNation.push('NO') : false;
        document.querySelector('#check-CA').checked ? buttonNation.push('CA') : false;
        document.querySelector('#check-US').checked ? buttonNation.push('US') : false;
        initFriends.randomuser.nat = buttonNation;
    }

    //* Зчитуємо дані з сервера за рядком вибору
    async function readDateServer() {
        const response = await fetch(initFriends.randomuser.fullUrl);
        response.ok ? dateFriendsServer = await response.json()
            : alert("Error HTTP: " + response.status);
    };

    //* Оновлюємо мінімальний і максимальний вік
    function updateForm() {
        initFriends.filter.age.min = Math.min(...dateFriendsServer.results.map(friends => friends.dob.age));
        initFriends.filter.age.max = Math.max(...dateFriendsServer.results.map(friends => friends.dob.age));

        document.querySelector('#check-minAge').min = initFriends.filter.age.min;
        document.querySelector('#check-minAge').max = initFriends.filter.age.max;
        document.querySelector('#check-minAge').value = initFriends.filter.age.min;

        document.querySelector('#check-maxAge').min = initFriends.filter.age.min;
        document.querySelector('#check-maxAge').max = initFriends.filter.age.max;
        document.querySelector('#check-maxAge').value = initFriends.filter.age.max;
    }

    //* Зчитуємо вибір користувача
    function readСhoiceForFiltre() {
        // рядок пошуку прізвища
        initFriends.filter.searchName = document.querySelector('#input-name').value;
        // напрямок сортування
        document.querySelector('#check-sort-nameABC').checked ? initFriends.sortCard.nameABC = true : initFriends.sortCard.nameABC = false;
        document.querySelector('#check-sort-nameZYX').checked ? initFriends.sortCard.nameZYX = true : initFriends.sortCard.nameZYX = false;
        document.querySelector('#check-sort-dobMinMax').checked ? initFriends.sortCard.dobMinMax = true : initFriends.sortCard.dobMinMax = false;
        document.querySelector('#check-sort-dobMaxMin').checked ? initFriends.sortCard.dobMaxMin = true : initFriends.sortCard.dobMaxMin = false;
        // кількість відображаємих даних на картці        
        document.querySelector('#check-location').checked ? initFriends.showCardInfo.location = true : initFriends.showCardInfo.location = false;
        document.querySelector('#check-email').checked ? initFriends.showCardInfo.email = true : initFriends.showCardInfo.email = false;
        document.querySelector('#check-phone').checked ? initFriends.showCardInfo.phone = true : initFriends.showCardInfo.phone = false;
        document.querySelector('#check-cell').checked ? initFriends.showCardInfo.cell = true : initFriends.showCardInfo.cell = false;
        // забезпечення коректного вибору мінімального і максимального віку
        initFriends.filter.age.currentMin = document.querySelector('#check-minAge').value;
        initFriends.filter.age.currentMax = document.querySelector('#check-maxAge').value;
        document.querySelector("#check-minAge").
            addEventListener("click", (event) => {
                document.querySelector('#check-minAge').value > initFriends.filter.age.currentMax ?
                    document.querySelector('#check-minAge').value = initFriends.filter.age.currentMax : false;
            });
        document.querySelector("#check-maxAge").
            addEventListener("click", (event) => {
                document.querySelector('#check-maxAge').value < initFriends.filter.age.currentMin ?
                    document.querySelector('#check-maxAge').value = initFriends.filter.age.currentMin : false;
            });
        initFriends.filter.age.currentMin = document.querySelector('#check-minAge').value;
        initFriends.filter.age.currentMax = document.querySelector('#check-maxAge').value;
    }

    //* Формуємо новий об'єкт з тими даними що потрібно відобразити
    function createDateForVisible(dbFriends) {
        // сформували масив об'єктів другів 
        let dbScreen = [];
        dbScreen.length = 0;
        [...dbFriends.results].map(elem => {
            dbScreen.push({
                picture: elem.picture.large,
                name: [elem.name.title, elem.name.first, elem.name.last].join(' '),
                nameForSort: [elem.name.last, elem.name.first].join(' '),
                dobDate: (new Date(elem.dob.date)).toString().substring(4, 15),
                dobDateForSort: new Date(elem.dob.date),
                dobAge: elem.dob.age,
                gender: elem.gender,
                nat: elem.nat,
                locationCity: elem.location.city,
                locationCountry: elem.location.country,
                phone: elem.phone,
                cell: elem.cell,
                email: elem.email,
            });
        });
        return dbScreen;
    }

    //* Фільтація по імені
    function filtrationName(dbFriends) {
        return [...dbFriends].filter(elem =>
            elem.name.indexOf(initFriends.filter.searchName) !== -1)
    }

    //* Фільтація по віку
    function filtrationAge(dbFriends) {
        return [...dbFriends].filter(elem => ((initFriends.filter.age.currentMin <= elem.dobAge)
            && (initFriends.filter.age.currentMax >= elem.dobAge)))
    }

    //* Фільтація - відображення локації
    function filtrationFieldLocation(dbFriends) {
        return initFriends.showCardInfo.location ? [...dbFriends]
            : [...dbFriends].reduce((filteredArray, friend) => {
                delete friend.locationCity;
                delete friend.locationCountry;
                filteredArray.push(friend);
                return filteredArray;
            }, []);
    }

    //* Фільтація - відображення електронної адреси
    function filtrationFieldEmail(dbFriends) {
        return initFriends.showCardInfo.email ? [...dbFriends]
            : [...dbFriends].reduce((filteredArray, friend) => {
                delete friend.email;
                filteredArray.push(friend);
                return filteredArray;
            }, []);
    }

    //* Фільтація - відображення телефона
    function filtrationFieldPhone(dbFriends) {
        return initFriends.showCardInfo.phone ? [...dbFriends]
            : [...dbFriends].reduce((filteredArray, friend) => {
                delete friend.phone;
                filteredArray.push(friend);
                return filteredArray;
            }, []);
    }

    //* Фільтація - відображення мобільного
    function filtrationFieldCell(dbFriends) {
        return initFriends.showCardInfo.cell ? [...dbFriends]
            : [...dbFriends].reduce((filteredArray, friend) => {
                delete friend.cell;
                filteredArray.push(friend);
                return filteredArray;
            }, []);
    }

    //* Сортування ABC
    function sortNameABC(dbFriends) {
        return initFriends.sortCard.nameABC ?
            [...dbFriends].sort((a, b) => a.nameForSort > b.nameForSort ? 1 : -1)
            : [...dbFriends];
    }

    //* Сортування ZYX
    function sortNameZYX(dbFriends) {
        return initFriends.sortCard.nameZYX ?
            [...dbFriends].sort((a, b) => a.nameForSort < b.nameForSort ? 1 : -1)
            : [...dbFriends];
    }

    //* Сортування вік Min --> Max
    function sortDobMinMax(dbFriends) {
        return initFriends.sortCard.dobMinMax ?
            [...dbFriends].sort((a, b) => a.dobDateForSort.getTime() > b.dobDateForSort.getTime() ? 1 : -1)
            : [...dbFriends];
    }

    //* Сортування вік Max --> Min
    function sortDobMaxMin(dbFriends) {
        return initFriends.sortCard.dobMaxMin ?
            [...dbFriends].sort((a, b) => a.dobDateForSort.getTime() < b.dobDateForSort.getTime() ? 1 : -1)
            : [...dbFriends];
    }

    //* Формуємо сітку у CSS під зображення
    function createMarkupCSS() {
        initFriends.gridFriends.columns = Math.floor(document.querySelector(".main").offsetWidth / initFriends.profileCard.width) - 2;
        initFriends.gridFriends.columns < 1 ? initFriends.gridFriends.columns = 1 : false;
        // initFriends.gridFriends.rows = Math.floor(document.querySelector(".main").clientHeight / initFriends.profileCard.height);
        // if (initFriends.gridFriends.rows < 1) { initFriends.gridFriends.rows = 1 };
        // вираховуємо кількість рядків/колонок                
        document.documentElement.style.setProperty('--columns-card', initFriends.gridFriends.columns);
        // document.documentElement.style.setProperty('--rows-card', initFriends.gridFriends.rows);
        console.log(document.querySelector(".main").clientHeight);
        // console.log(document.querySelector(".main").clientWidth, " - ", document.querySelector(".nav").clientWidth);

    }

    //* Формування DOM
    function createDOM(dbFriends) {
        // новий масив і видаляємо зайві поля        
        let dbVisible = [...dbFriends].reduce((filteredArray, friend) => {
            delete friend.nameForSort;
            delete friend.dobDateForSort;
            filteredArray.push(friend);
            return filteredArray;
        }, []);
        // формуємо ДОМ
        let parentDiv = document.createElement("div");
        parentDiv.className = "main__div";
        document.querySelector(".main__div").replaceWith(parentDiv);
        let fieldPlay = [];

        // отримуєм масив ключів від карток
        dbVisible.map(card => {
            fieldPlay.push(`<div class="div__card">
            <div class="card-image">                
                <img class="card-photo" src=${card.picture} alt = "" >
            </div>
            <div class="card-text">
                <p>${card.name}</p>                
                <p>${card.dobDate}</p>
                <p>${card.dobAge} year - ${card.gender}</p>
                <p>${card.nat}</p>`);
            card.propertyIsEnumerable('locationCity') ? fieldPlay.push(`<p>${card.locationCountry}</p>`) : false;
            card.propertyIsEnumerable('locationCity') ? fieldPlay.push(`<p>${card.locationCity}</p>`) : false;
            card.propertyIsEnumerable('phone') ? fieldPlay.push(`<p>${card.phone}</p>`) : false;
            card.propertyIsEnumerable('cell') ? fieldPlay.push(`<p>${card.cell}</p>`) : false;
            card.propertyIsEnumerable('email') ? fieldPlay.push(`<p>${card.email}</p>`) : false;
            fieldPlay.push(`</div></div>`);
            parentDiv.innerHTML = fieldPlay.join('');
        })
        return dbVisible;
    }


    //* Повторне завантаження з сервера
    ["click", "input"].forEach(event => {
        [...document.querySelectorAll(".nav__server")].map(elem => {
            elem.addEventListener(event, async () => {
                await filterBeforeServer(); // фільтрація вибору користовача
                await readDateServer(); // Зчитуємо дані з сервера 
                await updateForm(); // оновлюємо вік            
                document.querySelector(".nav__local").click();
            });
        })
    });

    //* Робота з локальним об'єктом
    ["click", "input"].forEach(event => {
        [...document.querySelectorAll(".nav__local")].map(elem => {
            elem.addEventListener(event, async () => {
                // передаємо дані для формування сітки                                     
                await readСhoiceForFiltre(); // фіксуємо дані для майбутньої фільтрації відображення
                createMarkupCSS(); // ініціалізація сітки для відображення                            
                createDOM(
                    sortDobMaxMin(
                        sortDobMinMax(
                            sortNameZYX(
                                sortNameABC(
                                    filtrationFieldCell(
                                        filtrationFieldPhone(
                                            filtrationFieldEmail(
                                                filtrationFieldLocation(
                                                    filtrationAge(
                                                        filtrationName(
                                                            createDateForVisible(dateFriendsServer))))))))))));
            });
        });
    });

    //* Імітація першого натискання для считування з сервера
    document.querySelector(".nav__server").click();

    window.onresize = createMarkupCSS;
});
