var LOGOS_PATH = 'images/logos/';
var LOGOS = [LOGOS_PATH + 'default.png', LOGOS_PATH + 'chrome.png', LOGOS_PATH + 'comdirect.png'];

var db;
var passphrase = "secret";

var accountListContainer = new Vue({
    el: '#account_list_container',
    data: {
        accounts: loadData()
    },
    methods: {
        clearDatabase: function() {
            db.accounts.clear();
            this.accounts = loadData();
        },

        putTestdata: function() {
            db.accounts.add({
                name: 'Sparkasse',
                icon: 'images/logos/sparkasse.png',
                username: 'Ivan',
                email: '@yahoo',
                passwort: 'xxx'
            });

            db.accounts.add({
                name: 'Comdirect',
                icon: 'images/logos/comdirect.png',
                username: 'Johann',
                email: '@gmail',
                passwort: 'abc'
            });

            this.accounts = loadData();
        },

        deleteAccount: function (account) {
            db.accounts.where("name").anyOf(account.name).delete();
            this.accounts = loadData();
        },

        showAccountInfo: function (mode, account) {
            accountModal.mode = mode;
            accountModal.account = account;
        },

        createAccount: function () {
            accountModal.mode = 'create';
            accountModal.account = {icon: LOGOS[0]};
        },

        copyToClipboard: function (toCopy) {
            copyToClipboard(toCopy);
        }
    }
});

var accountModal = new Vue({
    el: '#account_modal',
    data: {
        mode: 'info',
        account: {icon: 'images/logos/default.png'},
        logos: LOGOS,
        selectedLogo: LOGOS[0]
    },
    methods: {
        createAccount: function () {
            try {
                db.accounts.add({
                    name: encrypt(this.account.name),
                    icon: encrypt(this.account.icon),
                    username: encrypt(this.account.username),
                    email: encrypt(this.account.email),
                    passwort: encrypt(this.account.passwort),
                    pin: encrypt(this.account.pin),
                    zugangsnummer: encrypt(this.account.zugangsnummer),
                    kundennummer: encrypt(this.account.kundennummer),
                    mitgliedsnummer: encrypt(this.account.mitgliedsnummer),
                    sicherheitsfrage: encrypt(this.account.sicherheitsfrage),
                    antwort: encrypt(this.account.antwort),
                    sonstiges: encrypt(this.account.sonstiges)
                });

                accountListContainer.accounts = loadData();
                $("#btn_close_modal").click();
            } catch (e) {
                alert('Leider ist ein Fehler aufgetreten: ' + e.message);
                console.log('Error at creating new account: ' + e);
            }
        },

        editAccount: function () {
            this.mode = 'edit';
            try {
                db.accounts.where("name").anyOf(this.account.name).delete();

                db.accounts.add({
                    name: encrypt(this.account.name),
                    icon: encrypt(this.account.icon),
                    username: encrypt(this.account.username),
                    email: encrypt(this.account.email),
                    passwort: encrypt(this.account.passwort),
                    pin: encrypt(this.account.pin),
                    zugangsnummer: encrypt(this.account.zugangsnummer),
                    kundennummer: encrypt(this.account.kundennummer),
                    mitgliedsnummer: encrypt(this.account.mitgliedsnummer),
                    sicherheitsfrage: encrypt(this.account.sicherheitsfrage),
                    antwort: encrypt(this.account.antwort),
                    sonstiges: encrypt(this.account.sonstiges)
                });

                accountListContainer.accounts = loadData();
                $("#btn_close_modal").click();
            } catch (e) {
                alert('Leider ist ein Fehler aufgetreten: ' + e.message);
                console.log('Error at creating new account: ' + e);
            }
        },

        copyToClipboard: function (toCopy) {
            copyToClipboard(toCopy);
        }
    }
});


$(document).ready(function () {
    setupTextfields();
    setupAccountModal();
});

function loadData() {
    setupDatabase();

    var accountList = new Array("");
    db.accounts.each(function (account) {
        accountList.push(account);
    });
    accountList.pop(0);

    return accountList;
}

function setupDatabase() {
    db = new Dexie('storage');

    // Define a schema
    db.version(1).stores({
        accounts: 'name, icon, username, email, passwort, pin, zugangsnummer, kundennummer, mitgliedsnummer, sicherheitsfrage, antwort, sonstiges'
    });

    // Open the database
    db.open().catch(function (error) {
        console.log('ERROR: ' + error);
    });
}

function setupTextfields() {
    $('.textfield').each(function () {
        var $input = $(this).find('input:first');
        var $textarea = $(this).find('textarea:first');
        var $label = $(this).find('label:first');

        $input.attr('spellcheck', 'false');
        $textarea.attr('spellcheck', 'false');

        $input.focus(function () {
            $label.addClass('active');
        });
        $input.blur(function () {
            if ($input.val().length) {
                $label.addClass('active');
            } else {
                $label.removeClass('active');
            }
        });

        if(!$textarea.val() == '') {
            $label.addClass('active');
        }
        $textarea.focus(function () {
            $label.addClass('active');
        });
        $textarea.blur(function () {
            if ($textarea.val().length) {
                $label.addClass('active');
            } else {
                $label.removeClass('active');
            }
        });
    });
}

function setupAccountModal() {
    // setup icon-dropdrown
    var $ul = $('.dropdown-menu');
    $ul.find('li').each(function () {
        $(this).click(function () {
           var selectedIcon = $(this).find('img:first').attr('src');
            accountModal.account.icon = selectedIcon;
        });
    });
}

function copyToClipboard(toCopy) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(toCopy).select();
    document.execCommand("copy");
    $temp.remove();
}

function encrypt(str) {
    // console.log(str + ' -> ' + CryptoJS.AES.encrypt(str, passphrase));
    // return CryptoJS.AES.encrypt(str, passphrase);
    return str;
}

function decrypt(encStr) {
    return CryptoJS.AES.dencrypt(encStr, passphrase);
}