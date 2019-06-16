if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/ccuc/sw.js").then(function(reg) {
        console.log("registered service worker in scope: ", reg.scope);
    }, function(err) {
        console.log("failed to register service worker: ", err);
    });
}

let contents = document.getElementById("contents");

function round_to_half(n) { return Math.round(n * 2) / 2 }
function round_to_place(n, e) { return Math.round(n * Math.pow(10, e)) / Math.pow(10, e) }
function twos(n) { return Math.floor(n / 2) * 2 }
function get_ratio(f, s) { return s / f }
function get_correction_ratio(f, s) { return f / s }
function get_correction(n, s) {
    if (n >= 7) {
        return round_to_place((n - 7) * s, 1);
    } else {
        return 0;
    }
}

function notify(message) {
    document.documentElement.style.overflow = "hidden";

    document.getElementById("alert_message").innerHTML = message;
    document.getElementById("alert").style.display = "block";
}

function check(message, ok_callback, cancel_callback) {
    document.documentElement.style.overflow = "hidden";
    
    document.getElementById("confirm_message").innerHTML = message;

    document.getElementById("confirm").style.display = "block";

    document.getElementById("ok").addEventListener("click", ok_callback);
    document.getElementById("cancel").addEventListener("click", cancel_callback);
}

class Food {
    constructor(name, cals, carbs) {
        this.name = name;
        this.cals = cals;
        this.carbs = carbs;
    }

    rough_units(ratio) {
        return this.carbs / ratio;
    }

    element(ratio, index, p_index) {
        let row = document.createElement("tr");
        let name = document.createElement("td");
        let cals = document.createElement("td");
        let carbs = document.createElement("td");
        let units = document.createElement("td");
        let delete_column = document.createElement("td");

        name.innerHTML = this.name;
        cals.innerHTML = String(Math.round(this.cals)) + " kcal";
        carbs.innerHTML = String(round_to_place(this.carbs, 1)) + "g";
        units.innerHTML = String(round_to_place(this.rough_units(ratio), 1));

        let delete_food = document.createElement("button");
        delete_food.classList.add("delete_food");
        delete_food.id = "df" + String(p_index) + "_" + String(index);

        delete_column.classList.add("delete_column");
        delete_food.innerHTML = "✖";
        delete_column.appendChild(delete_food);

        row.appendChild(name);
        row.appendChild(cals);
        row.appendChild(carbs);
        row.appendChild(units);
        row.appendChild(delete_column);

        return row;
    }
}

class Meal {
    constructor(level, food, ratio, c_ratio) {
        this.time = new Date().toLocaleTimeString();
        this.level = level;
        this.ratio = ratio;
        this.c_ratio = c_ratio;
        this.food = food;
    }

    copy(meal) {
        this.time = meal.time;
        this.level = meal.level;
        this.ratio = meal.ratio;
        this.c_ratio = meal.c_ratio;
        this.food = [];

        for (let food of meal.food) {
            this.food.push(new Food(food.name, food.cals, food.carbs));
        }
    }

    get total_cals() {
        return this.food
            .map((food) => food.cals)
            .reduce((acc, x) => acc + x);
    }

    get total_carbs() {
        return this.food
            .map((food) => food.carbs)
            .reduce((acc, x) => acc + x);
    }

    get correction() {
        return get_correction(this.level, this.c_ratio);
    }

    get units() {
        return round_to_half(this.total_carbs / this.ratio + this.correction);
    }

    add_food(food) {
        this.food.push(food);
    }

    element(index) {
        let meal = document.createElement("meal");

        let delete_meal = document.createElement("button");
        delete_meal.classList.add("delete_meal");
        delete_meal.id = "dm" + String(index);

        delete_meal.innerHTML = "✖";

        let time = document.createElement("span");
        let level = document.createElement("span");
        let ratio = document.createElement("span");
        let c_ratio = document.createElement("span");

        time.innerHTML = this.time + "<br />";
        level.innerHTML = "Blood Glucose Level: " + String(this.level) + "<br />";
        ratio.innerHTML = "Ratio: "
                        + String(round_to_place(this.ratio, 2)) + "<br />";
        c_ratio.innerHTML = "Correction ratio: "
                        + String(round_to_place(this.c_ratio, 1));

        meal.appendChild(delete_meal);
        meal.appendChild(time);
        meal.appendChild(level);
        meal.appendChild(ratio);
        meal.appendChild(c_ratio);

        let table = document.createElement("table");
        let header_row = document.createElement("tr");

        let name_header = document.createElement("th");
        let cals_header = document.createElement("th");
        let carbs_header = document.createElement("th");
        let units_header = document.createElement("th");

        name_header.innerHTML = "Name";
        cals_header.innerHTML = "Cals";
        carbs_header.innerHTML = "Carbs";
        units_header.innerHTML = "Units";

        header_row.appendChild(name_header);
        header_row.appendChild(cals_header);
        header_row.appendChild(carbs_header);
        header_row.appendChild(units_header);

        table.appendChild(header_row);

        if (this.food.length > 0) {
            for (let i in this.food) {
                table.appendChild(this.food[i].element(this.ratio, i, index));
            }

            let empty_row = document.createElement("tr");
            empty_row.appendChild(document.createElement("td"));
            empty_row.appendChild(document.createElement("td"));
            empty_row.appendChild(document.createElement("td"));
            empty_row.appendChild(document.createElement("td"));
        
            table.appendChild(empty_row); 
        }

        let correction_row = document.createElement("tr");
        let correction_name = document.createElement("td");
        let correction_units = document.createElement("td");

        correction_name.innerHTML = "Correction";
        correction_units.innerHTML = String(this.correction);

        correction_row.appendChild(correction_name);
        correction_row.appendChild(document.createElement("td"));
        correction_row.appendChild(document.createElement("td"));
        correction_row.appendChild(correction_units);

        let total_row = document.createElement("tr");
        let total_name = document.createElement("td");
        let total_cals = document.createElement("td");
        let total_carbs = document.createElement("td");
        let total_units = document.createElement("td");

        total_name.innerHTML = "Total";

        if (this.food.length > 0) {
            total_cals.innerHTML = String(Math.round(this.total_cals)) + " kcal";
            total_carbs.innerHTML = String(round_to_place(this.total_carbs, 1)) + "g";
            total_units.innerHTML = String(this.units);
        } else {
            total_carbs.innerHTML = "0g";
            total_units.innerHTML = String(round_to_half(this.correction));
        }

        total_row.appendChild(total_name);
        total_row.appendChild(total_cals);
        total_row.appendChild(total_carbs);
        total_row.appendChild(total_units);

        table.appendChild(correction_row);
        table.appendChild(total_row);

        meal.appendChild(table);

        return meal;
    }
}

class History {
    constructor() {
        let ratio_f = document.getElementById("ratio_f");
        let ratio_s = document.getElementById("ratio_s");
        let c_ratio_f = document.getElementById("c_ratio_f");
        let c_ratio_s = document.getElementById("c_ratio_s");

        let raw = localStorage.getItem("history");
        if (raw != null && raw != "") {
            let old = JSON.parse(raw);
            
            this.ratio_f = old.ratio_f;
            this.ratio_s = old.ratio_s;

            this.c_ratio_f = old.c_ratio_f;
            this.c_ratio_s = old.c_ratio_s;

            ratio_f.value = old.ratio_f;
            ratio_s.value = old.ratio_s;

            c_ratio_f.value = old.c_ratio_f;
            c_ratio_s.value = old.c_ratio_s;

            this.meals = [];
            for (let meal of old.meals) {
                let m = new Meal();
                m.copy(meal)
                this.meals.push(m);
            }
        } else {
            this.ratio_f = Number(ratio_f.value);
            this.ratio_s = Number(ratio_s.value);

            this.c_ratio_f = Number(c_ratio_f.value);
            this.c_ratio_s = Number(c_ratio_s.value);

            this.meals = [];
        }
    }

    get ratio() {
        return get_ratio(this.ratio_f, this.ratio_s);
    }

    get c_ratio() {
        return get_correction_ratio(this.c_ratio_f, this.c_ratio_s);
    }

    save() {
        localStorage.setItem("history", JSON.stringify(this));
    }

    add_meal(meal) {
        this.meals.push(meal);
    }

    render() {
        while (contents.firstChild) {
            contents.removeChild(contents.firstChild);
        }

        for (let i in this.meals) {
            contents.appendChild(this.meals[i].element(i));
            contents.appendChild(document.createElement("hr"));
        }
        if (contents.lastChild) {
            contents.removeChild(contents.lastChild);
        }
    }
}

window.onload = function() {
    let history = new History();
    history.render();
    
    window.onunload = function() {
        history.save();
    };

    window.onbeforeunload = function() {
        history.save();
    };

    for (element of document.getElementsByClassName("close_dialogue")) {
        element.addEventListener("click", function() {
            document.documentElement.style.overflow = "auto";
            this.parentElement.parentElement.style.display = "none";
        });
    }

    let add_food_item = document.getElementById("add_food_item");
    let new_meal = document.getElementById("new_meal");
    let utility_toggle = document.getElementById("tcarbutils");
    
    let register_delete_food = function() {
        let buttons = document.getElementsByClassName("delete_food");
        for (let button of buttons) {
            button.onclick = function() {
                let indexes = button.id.substring(2).split("_");
                history.meals[Number(indexes[0])].food
                    .splice(Number(indexes[1]), 1);
                history.save();
                history.render();
                register_delete_meals();
                register_delete_food();
            };
        }
    };

    let register_delete_meals = function() {
        let buttons = document.getElementsByClassName("delete_meal");
        for (let button of buttons) {
            button.onclick = function() {
                check("Are you sure you want to delete this meal?", function() {
                    history.meals.splice(Number(button.id.substring(2)), 1);
                    history.save();
                    history.render();
                    register_delete_meals();
                    register_delete_food();
                });
            };
        }
    };
    register_delete_meals();
    register_delete_food();

    add_food_item.onclick = function() {
        let name_element = document.getElementById("name");
        let cals_element = document.getElementById("cals");
        let carbs_element = document.getElementById("carbs");
        
        let name = name_element.value;
        let cals = Number(cals_element.value);
        let carbs = Number(carbs_element.value);
        
        if (history.meals.length > 0) {
            if (name != "" && cals > 0) {
                history.meals[history.meals.length - 1]
                    .add_food(new Food(name, cals, carbs));
                history.save();
                history.render();
                register_delete_meals();
                register_delete_food();

                name_element.value = "";
                cals_element.value = "";
                carbs_element.value = "";

                document.getElementById("carbs_in_hundred").value = "";
                document.getElementById("cals_in_hundred").value = "";
                document.getElementById("food_weight").value = "";
            } else {
                if (name == "") {
                    notify("Food item must have name!");
                } else {
                    notify("Food must contain calouries!")
                }
            }
        } else {
            notify("No meals to add item to!");
        }
    };

    utility_toggle.onclick = function() {
        let utilities = document.getElementById("utilities");
        let symbol = document.getElementById("cuts");
        let cals_input = document.getElementById("cals");
        let carbs_input = document.getElementById("carbs");

        if (utilities.style.display !== "block") {
            utilities.style.display = "block";
            symbol.innerHTML = "↑";

            cals_input.readOnly = true;
            carbs_input.readOnly = true;
        } else {
            utilities.style.display = "none";
            symbol.innerHTML = "↓";
            
            cals_input.readOnly = false;
            carbs_input.readOnly = false;
        }
    };

    let cals_in_hundred = document.getElementById("cals_in_hundred");
    let carbs_in_hundred = document.getElementById("carbs_in_hundred");
    let food_weight = document.getElementById("food_weight");

    let update_carbs = function() {
        if (document.getElementById("utilities").style.display !== "none") {
            let cals_val = Number(cals_in_hundred.value);
            let carbs_val = Number(carbs_in_hundred.value);
            let weight_val = Number(food_weight.value);

            let cals_input = document.getElementById("cals");
            let carbs_input = document.getElementById("carbs");

            cals_input.value = String(Math.round(cals_val * (weight_val / 100)));
            carbs_input.value = String(round_to_place(carbs_val * (weight_val / 100), 1));
        }
    };

    cals_in_hundred.onchange = update_carbs;
    carbs_in_hundred.onchange = update_carbs;
    food_weight.onchange = update_carbs;

    new_meal.onclick = function() {
        let level_element = document.getElementById("level");
        let level = Number(level_element.value);
        if (level != 0 && history.ratio > 0 && history.c_ratio > 0) {
            history.add_meal(new Meal(level, [], history.ratio, history.c_ratio));
            history.save();
            history.render();
            register_delete_meals();
            register_delete_food();

            level_element.value = "";
        } else {
            if (history.ratio <= 0 || isNaN(history.ratio)) {
                notify("Ratio cannot be equal or less than zero!");
            } else if (history.c_ratio <= 0 || isNaN(history.c_ratio)) {
                notify("Correction ratio cannot be equal or less than zero!");
            } else {
                notify("Blood glucose level cannot be zero!");
            }
        }
    };

    let ratio_f = document.getElementById("ratio_f");
    let ratio_s = document.getElementById("ratio_s");
    let c_ratio_f = document.getElementById("c_ratio_f");
    let c_ratio_s = document.getElementById("c_ratio_s");

    ratio_f.oninput = function() {
        history.ratio_f = Number(ratio_f.value);
        history.save();
        history.render();
    };

    ratio_s.oninput = function() {
        history.ratio_s = Number(ratio_s.value);
        history.save();
        history.render();
    };
    
    c_ratio_f.oninput = function() {
        history.c_ratio_f = Number(c_ratio_f.value);
        history.save();
        history.render();
    };

    c_ratio_s.oninput = function() {
        history.c_ratio_s = Number(c_ratio_s.value);
        history.save();
        history.render();
    };

    let impexp_toggle = document.getElementById("timpexp");
    let export_button = document.getElementById("export");
    let import_button = document.getElementById("import");

    impexp_toggle.onclick = function() {
        let impexp = document.getElementById("impexp");
        let symbol = document.getElementById("impexpts");

        if (impexp.style.display !== "block") {
            impexp.style.display = "block";
            symbol.innerHTML = "↑";
        } else {
            impexp.style.display = "none";
            symbol.innerHTML = "↓";
        }
    };

    export_button.onclick = function() {
        let output = document.getElementById("output");
        output.value = JSON.stringify(history);
    };

    import_button.onclick = function() {
        check("Are you sure you want to load this data?", function() {
            let input = document.getElementById("input").value;
            localStorage.setItem("history", input);
            history = new History();
            history.render();
        });
    };
}
