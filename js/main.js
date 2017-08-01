var LOGOS_PATH = 'images/logos/';
var LOGOS = [LOGOS_PATH + 'default.png', LOGOS_PATH + 'chrome.png', LOGOS_PATH + 'comdirect.png'];

var db;
var passphrase = null;

var header = new Vue({
    el: '#header',
    data: {
        loggedIn: false,
        passphrase: null
    },
    methods: {
        login: function () {
            login(this.passphrase);
            this.loggedIn = true;
        },

        logout: function () {
            logout();
            this.loggedIn = false;
        }
    }
});

var accountListContainer = new Vue({
    el: '#account_list_container',
    data: {
        visible: false,
        accounts: loadData()
    },
    methods: {
        clearDatabase: function () {
            db.accounts.clear();
            this.accounts = loadData();
        },

        putTestdata: function () {
            db.accounts.add({
                name: encrypt('Sparkasse'),
                icon: 'images/logos/sparkasse.png',
                username: encrypt('Ivan'),
                email: encrypt('@yahoo'),
                passwort: encrypt('xxx')
            });

            db.accounts.add({
                name: encrypt('Comdirect'),
                icon: 'images/logos/comdirect.png',
                username: encrypt('Johann'),
                email: encrypt('@gmail'),
                passwort: encrypt('abc')
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
        },

        openFileChooser: function () {
            if (typeof window.FileReader !== 'function') {
                alert("The file API isn't supported on this browser yet.");
                return;
            }

            $('#backup_file').trigger('click');
        },

        applyBackupFile: function () {
            var input = document.getElementById('backup_file');
            var fr = new FileReader();
            fr.onloadend = function (e) {
                try {
                    var lines = e.target.result;
                    var jsonSaveFile = JSON.parse(lines);
                    if (jsonSaveFile.accounts == null || !jsonSaveFile.accounts.length) {
                        $('#backup_container').find('.alert-danger').show();
                        return;
                    }

                    for(account of jsonSaveFile.accounts) {
                        console.log(account);
                    }

                    console.log($('#backup_container').find('.alert-success'));
                    $('#backup_container').find('.alert-success').show();

                } catch (e) {
                    $('#backup_container').find('.alert-danger').show();
                    console.log('ERROR at loading the backup: ' + e);
                }
            };
            fr.readAsText(input.files[0]);
        },

        createBackupFile: function () {
            var jsonString;
            var downloadlink = $('#download_backup_file');

            var data = {};
            data.accounts = new Array();
            for (account of this.accounts) {
                var newAccount = {};
                newAccount.name = encrypt(account.name);
                newAccount.icon = account.icon;
                newAccount.username = encrypt(account.username);
                newAccount.email = encrypt(account.email);
                newAccount.passwort = encrypt(account.passwort);
                newAccount.pin = encrypt(account.pin);
                newAccount.zugangsnummer = encrypt(account.zugangsnummer);
                newAccount.kundennummer = encrypt(account.kundennummer);
                newAccount.mitgliedsnummer = encrypt(account.mitgliedsnummer);
                newAccount.sicherheitsfrage = encrypt(account.sicherheitsfrage);
                newAccount.antwort = encrypt(account.antwort);
                newAccount.sonstiges = encrypt(account.sonstiges);

                data.accounts.push(newAccount);
            }
            jsonString = JSON.stringify(data, null, 2);

            var jsonFile = new Blob([jsonString], {type: 'application/json'});
            downloadlink.attr("href", window.URL.createObjectURL(jsonFile));
            downloadlink[0].click();
        }
    }
});

var accountModal = new Vue({
    el: '#account_modal',
    data: {
        visible: false,
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
                    icon: this.account.icon,
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
                    icon: this.account.icon,
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

    var accounts = new Array("");
    if (passphrase != null && passphrase.length) {
        db.accounts.each(function (account) {
            account.name = decrypt(account.name);
            account.username = decrypt(account.username);
            account.email = decrypt(account.email);
            account.passwort = decrypt(account.passwort);
            account.pin = decrypt(account.pin);
            account.zugangsnummer = decrypt(account.zugangsnummer);
            account.kundennummer = decrypt(account.kundennummer);
            account.mitgliedsnummer = decrypt(account.mitgliedsnummer);
            account.sicherheitsfrage = decrypt(account.sicherheitsfrage);
            account.antwort = decrypt(account.antwort);
            account.sonstiges = decrypt(account.sonstiges);
            accounts.push(account);
        });
    }
    accounts.pop(0);

    return accounts;
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

function login(pph) {
    passphrase = pph;
    accountModal.visible = true;
    accountListContainer.visible = true;
    accountListContainer.accounts = loadData();

    setTimeout(function(){ setupTextfields(); }, 2000);
}

function logout() {
    passphrase = null;
    header.passphrase = null;
    header.loggedIn = true;
    accountListContainer.visible = false;
    accountModal.visible = false;
}

function copyToClipboard(toCopy) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(toCopy).select();
    document.execCommand("copy");
    $temp.remove();
}

function encrypt(str) {
    if (str == null || !str.length) {
        return null;
    }

    return CryptoJS.AES.encrypt(str, passphrase).toString();
}

function decrypt(encStr) {
    if (encStr == null || !encStr.length) {
        return null;
    }

    return CryptoJS.AES.decrypt(encStr, passphrase).toString(CryptoJS.enc.Utf8);
}