//get all the variables
//get randommeal > addmeal()
//get meal by ID
//get meal by SEARCH
//perform localstorage > addfavls() > removels() > getls()
//fetch fav_meals() , get here and pass the data to below function [addmeals]
//addmeals to fav()
//say hi to user and suggest if no meals are added to fav
//implement search term functionality
// add a pop-up functionality NOTE : be careful aout the close buttons as well



//get all the required variables
let meals = document.getElementById("meals");
let ul_element = document.getElementById("fav_meals");
let empty_message = document.getElementById("empty_text");
let search_input_term = document.getElementById("search_term");
let search_btn = document.getElementById("search");
let meal_pop_up = document.getElementById("meal_popup");
let meal_information = document.getElementById("meal_info");
let pop_up_close_btn = document.getElementById("close_popup");


GetRandomMeal();
FavMeals();

//get randommeal
async function GetRandomMeal(){
   //meals.innerHTML = '';  // need to show only 1 data as a random meal, so cleaning up here.
   let raw_response_url = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
   let convert_as_json = await raw_response_url.json();
   let RandomMealData = convert_as_json.meals[0];

   console.log(RandomMealData);
   AddMeal(RandomMealData , true);
}

//get meal by ID
async function GetMelaById(id){
   let raw_response_url = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id)
   let convert_as_json = await raw_response_url.json();
   let RandomMealData = convert_as_json.meals[0];
   return RandomMealData;
}

//get meal by SEARCH
async function GetMealBySearch(term){
   let raw_response_url = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
   let convert_as_json = await raw_response_url.json();
   let RandomMealData = convert_as_json.meals;
   //console.log(RandomMealData);
   return RandomMealData;
}


//get addmeal function and show in UI
// >> we are by-default setting random as false, on function call we'll change [line : 17]
function AddMeal(RandomMealData, random = false){
   let meal = document.createElement("div");

   meal.classList.add("meal");
   meal.innerHTML = `
         <div class="meal_header">
         ${random ?
            `<span class="random_text">Random Recipe</span>`
                  : " "}
            <img src="${RandomMealData.strMealThumb}" alt="${RandomMealData.strMeal}">
         </div>

         <div class="meal_body">
            <h4>${RandomMealData.strMeal}</h4>
            <button class="fav_btn">
               <i class="fa fa-heart"></i>
            </button>
         </div>
 
   ` 
   meal.querySelector("img").addEventListener("click" , () => { // click should only apply to image
      PopUpData(RandomMealData) //call the pop-up data, it'll list out the recipe instructions
   });

   meals.appendChild(meal);

   let btn = meal.querySelector("button");
   //console.log(btn.classList.contains("active"));
       btn.addEventListener("click" , () => {
   //console.log(btn.classList.contains("active"));
         if(btn.classList.contains("active")){    //if the btn was added to fav then it contains "active" class
            RemoveFromLocalStorage(RandomMealData.idMeal);
            btn.classList.remove("active");
         }
         else{
            AddToLocalStorage(RandomMealData.idMeal);
            btn.classList.add("active");
         }
         FavMeals(); // fetch fav_meals at every click, so the contents will be updated
   console.log(btn.classList.contains("active")); 

   });
}

//for localstorage
//Adding items to LocalStorage
function AddToLocalStorage(RandomMealData){
   let mealIDs = GetLocalStorage();
   localStorage.setItem("mealId", JSON.stringify([...mealIDs , RandomMealData]));
   //console.log(`Added : ${mealIDs}`);
}

//Removing items to LocalStorage
function RemoveFromLocalStorage(RandomMealData){ 
   let mealIDs = GetLocalStorage();
   localStorage.setItem("mealId", JSON.stringify(mealIDs.filter((id) => id!== RandomMealData)));
}

//Contents of the LocalStorage out of which we removed and added
function GetLocalStorage(){
   let mealIDs = JSON.parse(localStorage.getItem("mealId"));
   AddForEmptyContent(mealIDs); // see the list is empty or not
   return mealIDs === null ? [] :  mealIDs;
}


//Fetch fav meals
async function FavMeals(){
   ul_element.innerHTML = " ";
   let mealIDs = GetLocalStorage();
   //let meals = [];
   for(let i=0 ; i<mealIDs.length ; i++){
      let mealID = mealIDs[i];
      meal = await GetMelaById(mealID);
      // meals.push(meal);
      AddMealToFav(meal);
      console.log(mealIDs);
   }
}

//add meals to fav
function AddMealToFav(meal){
   let li_element = document.createElement("li");
       li_element.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <span>${meal.strMeal}</span>
            <button id="clear"><i class="far fa-times-circle"></i></button>
       `;
       li_element.querySelector("img").addEventListener("click" , () => {
       PopUpData(meal)
   });

   ul_element.appendChild(li_element);

   let close_btn = li_element.querySelector("#clear")
       close_btn.addEventListener("click" , () => {
          RemoveFromLocalStorage(meal.idMeal);
          FavMeals() // again fetch the fav meal to update the contents
       });
}

//say hi to user and suggest if no meals are added to fav
function AddForEmptyContent(mealIDs){
   if(mealIDs.length <1){
      let empty_txt_para = document.createElement("p");
      empty_txt_para.textContent = "Hi mate, have a great day with starting good food"
      empty_message.appendChild(empty_txt_para);
   }
   else{
      empty_message.remove();
   }
};

//search_term functionallity
search_btn.addEventListener("click" , async () => {
   meals.innerHTML = ' ';  //make meals div empty to get new foods all time, if not it will keep appending with existing search
   let search_value = search_input_term.value;
   let search_data = await GetMealBySearch(search_value);
      if(search_value.length !== 0 ){  // alert user if search is empty
         search_data.forEach((item) => {
            AddMeal(item);
          });   
      }
      else{
         alert("Hi Mate, you forgot to input your food");
         GetRandomMeal(); // I don't want it to be empty 
      }
   search_input_term.value = "";
   search_input_term.focus();
})

//close pop-up
pop_up_close_btn.addEventListener("click" , () => {
   meal_pop_up.classList.add("hidden");
})

//pop-up update info
function PopUpData(meal){
   
   meal_information.innerHTML = ''; // cleaning the looping append infomation content

   let popup_data = document.createElement("div");
       
       let ingredients = []; // to store the ingredient and measure

       for(let i=1 ; i<=20 ; i++){ //since the ingredient length is 20 only

              if(meal["strIngredient" + i]){
                 //store
                 ingredients.push(`${meal['strIngredient' + i] } / ${meal['strMeasure' + i]}`)
              }
              else{
                 break;
              }
       };

       popup_data.innerHTML = `
         <h1>${meal.strMeal}</h1>
                  
         <img src="${meal.strMealThumb}" alt="${meal.strMeal}">

         <p> <b>INSTRUCTIONS</b> : ${meal.strInstructions}</p>
         
         <br />

         <h4>INGREDIENTS</h4>
         <ul>
            ${ingredients.map((item) => `<li class="ingredient_li" >${item}</li>`).join("")};
         </ul>
   `; 

   meal_information.appendChild(popup_data);
   meal_pop_up.classList.remove("hidden");
}