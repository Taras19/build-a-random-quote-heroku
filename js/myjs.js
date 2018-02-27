document.addEventListener("DOMContentLoaded", function(){
  var body = document.querySelector("body");
  /* фото автора*/
  var photoAuthor = document.querySelector(".photo-author");
  /*цитата*/
  var blockquote = document.querySelector("blockquote");
  /*автор*/
  var cite = document.querySelector("cite");
  /*вибір автора*/
  var select = document.querySelector(".choice-author ");
  /* відфільтрований список по авторам ,цитати які ще не виводились*/
  var listFilter;
  /* кнопка для переходу до наступної цитати*/
  var next = document.querySelector(".next-js");
   /* кнопка для переходу до форми додавання нових цитат*/
  var transitionForm= document.querySelector(".form-js");
  /* список цитат отриманий з сервера */
  var list;
  /*список для зберігання фамілій авторів*/
  var listAuthor = [];
  /* випадкове число використовується як index цитати у списку*/
  var index;
  /*загальна к-сть цитат для передачі в html*/
  var lengthCurrentList = document.querySelector(".lengthCurrentList");
  /* поточна к-сть виведених цитат для передачі в html*/
  var currentPosition = document.querySelector(".currentPosition");
  /* кількість вподобань цитати користувач змінює при click по preference-image*/
  var preferenceCount = document.querySelector(".preference-count");
  /* Сердечко використовується для вказання вподобання */
  var preferenceImage = document.querySelector(".preference-image");
 
  /* запит на сервер для отримання цитат*/
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load",function(){
    next.disabled = false;
    select.disabled = false;
    list = JSON.parse(xhr.responseText);
    /*  при завантаженні передача інфо для першої цитати */
    /* визначення випадкового числа яке використовую як індекс*/
    index = getRandomInt(0,list.length - 1);
    /* передача інфо з масиву в html цитата,alt,src,автор*/
    getTransmissionInformation(list);
    /* кількість показаних та загальна к-сть цитат */
    getInfoCurrentPosition();
    /* створюю список авторів для заповнення select*/
    list.forEach(function(item){
      if(listAuthor.indexOf(item.author) == -1){
        listAuthor.push(item.author);
      }
    });
    listAuthor = listAuthor.sort();
    var option = document.createElement("option");
    listAuthor.forEach(function(item){
      /* добавляю в select відсортовані по коду option*/
      option = option.cloneNode(true);
      option.value = item;
      option.innerHTML = item;
      select.appendChild(option);
    });

    popupTooltip();

    /* подія для select при зміні автора формується новий список та
     оновлюється інфо в html*/
    select.addEventListener("change",processingEvent);
      
    /* подія для кнопки "наступна" формуємо новий список,передаєм інфо. в html*/
    next.addEventListener("click",processingEvent);
      
    /* при вдалому завантажені відповіді видаляю повідомлення про помилку*/
    var error = document.querySelector(".error");
    body.removeChild(error);

    /* обробка події при click по preference-image(сердечко),зміна background, кількості в preference-count,
    кількості preference в list(з нього формується відфільтрований список),відправка інфо на сервер для зміни
    preference в description.json  */
    preferenceImage.addEventListener("click",function(){
      preferenceImage.classList.add("preference-image-active");
      setTimeout(function(){preferenceImage.classList.remove("preference-image-active");},1000);
      preferenceCount.innerHTML = ++preferenceCount.innerHTML;
      ++list[blockquote.id].preference ;
      /*ввідправка id на сервер для зміни значення preference*/
      var xhr = new XMLHttpRequest();
      var body = JSON.stringify({
                   'id': blockquote.id
                  });
      xhr.open("POST", '/submit?', true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.send(body);
    });

    /**/
    transitionForm.addEventListener("click",function(){
      /* створення контейнеру для форми */
      var formContainer = document.createElement("div");
      formContainer.className = "form-container";
      /* створення div для закривання контейнеру з формою додавання нової цитати*/
      var close = document.createElement("div");
      close.className = "close";
      close.innerHTML = '&#215';
      /* створення форми*/
      var formAddQuote = document.createElement("div");
      formAddQuote.className = "form-add-quote";
      /* потрібний для копіювання в форму створення нової цитати */
      var choiceAuthorContainer = document.querySelector(".choice-author-container");
      /* копія для вставки в форму*/
      var choiceAuthorContainerForm = choiceAuthorContainer.cloneNode(true);
      /* зміна класу для select в контейнері щоб не плутатись з select на головній сторінці*/
      choiceAuthorContainerForm.firstElementChild.className = "choice-author-form";
      var textNewQuote = document.createElement("textarea");
      textNewQuote.placeholder = "Введіть текст цитати";
      textNewQuote.required = true ;
      textNewQuote.name = "textNewQuote" ;
      textNewQuote.className = "text-new-quote";
      /*клонування кнопки для додавання нової цитати,відсилання нв сервер нової цитати */
      var addQuote = next.cloneNode(true);
      addQuote.className = "next addQuote-js";
      if('ontouchstart' in window){
        addQuote.classList.add("next-touch");
      }
      addQuote.innerHTML = "Додати";
      /* додавання в форму контейнера та select */
      formAddQuote.appendChild(choiceAuthorContainerForm);
      /* вставка в форму textarea для тексту цитати*/
      formAddQuote.appendChild(textNewQuote);
      /* додавання в форму кнопки для відправки нової цитати на сервер та список загальний цитат */
      formAddQuote.appendChild(addQuote);
      /*додавання контейнеру форми*/
      formContainer.appendChild(close);
      formContainer.appendChild(formAddQuote);
      /*вставка контейнеру з формою в body */
      body.appendChild(formContainer);
      /* select у формі створення нової цитати*/
      var choiceAuthorForm = document.querySelector(".choice-author-form");
      /*подія для кнопки яка додає цитату в загальний список,відправляє інфо на сервер*/
      addQuote.addEventListener("click",function(){
        if(choiceAuthorForm.value != "Всі автори" && textNewQuote.value.length > 20){
          /* шукаю першу цитату в загальному списку з автором вказаним при створені нової цітати*/
          for(var i = 0; i < list.length; i++){
            /* перевіряю чи збігається автор цитати з автором вказаним при створені нової цитати*/
            if(list[i].author == choiceAuthorForm.value){
              var cloneQuoteDescription = {};
              /* заповняю клон копією з цитати того самого автора*/
              for(var key in list[i]){
                cloneQuoteDescription[key] = list[i][key];
              }
              /* змінюю в клоні дані на ті що ввів користувач,деякі обнулюю */
              cloneQuoteDescription.blockquote = textNewQuote.value;
              cloneQuoteDescription.id = list.length;
              cloneQuoteDescription.preference = 0;
              cloneQuoteDescription.show = false;
              /* вставляю в загальний список нову цитату*/
              list.push(cloneQuoteDescription);
              /**/
              var xhr = new XMLHttpRequest();
              var body = JSON.stringify(cloneQuoteDescription);
              xhr.addEventListener("loadstart",function(){
                var quoteSend = document.createElement("div");
                quoteSend.className = "quote-send";
                quoteSend.innerHTML = "<p>Цитата додана.</p>";
                formContainer.appendChild(quoteSend);
                setTimeout(function(){formContainer.removeChild(quoteSend);},4000);
              });
              xhr.open("POST", '/submit?', true);
              xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
              xhr.send(body);
              /* зупиняю виконання циклу все що потрібно зроблено далі ганяти цикл не потрібно */
              break;
            }
          }
          /*очищення textarea від введених даних після того як нова цитата додана до списку*/
          textNewQuote.value = "";
        }/* необраний автор обовязково потрібно вказувати автора для правильного відображення фото...*/
        else if(choiceAuthorForm.value == "Всі автори" && !document.querySelector(".error-message")){
          var errorMessage = document.createElement("div");
          errorMessage.className = "error-message";
          errorMessage.innerHTML = "<p>Цитата недодана.</p><p>Оберіть автора цитати.</p>";
          formContainer.appendChild(errorMessage);
          setTimeout(function(){formContainer.removeChild(errorMessage);},4000);
        }
      });
      /* подія для закривання форми для додавання нової цитати */
      close.addEventListener("click",function(){
        //body.removeChild(formContainer);
        formContainer.classList.add("hide-form-container");
      });
    });
  });

  xhr.open('GET','js/description.json', true);
  xhr.send();
    
  /* обробити помилку */
  
  xhr.addEventListener("loadend",function(){
    if(xhr.status !=200){
      /* відображення повідомлення при невдалому завантаженні цитат*/
      body.classList.add("showError-js");
    }
   
  });
  
  
  if ('ontouchstart' in window) {
    /* browser with Touch Events support */
    next.classList.add("next-touch");
    transitionForm.classList.add("next-touch");
  }
  
  /* визначення випадкового числа яке використовую як індекс*/
  function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* створення відсортованого списку */
  function getFilteredList(){
    if(select.value === "Всі автори"){
      listFilter = list.filter(function(item){
        return false === item.show;
      });
    }else{
        listFilter = list.filter(function(item){
          return select.value === item.author && false === item.show;
        });
      }
      
  }

  /* кількість показаних та загальна к-сть цитат оновлення інфо в html*/
  function getInfoCurrentPosition(){
    if(select.value === "Всі автори"){
      /* загальна довжина списку */
       lengthCurrentList.innerHTML = list.length;
       var numberShown = list.filter(function(item){
        return item.show === true ;
       });
       currentPosition.innerHTML = numberShown.length;
    } else{
        var currentFilterList = list.filter(function(item){
          return item.author === select.value ;
        });
        lengthCurrentList.innerHTML = currentFilterList.length;
        
        var numberShown = currentFilterList.filter(function(item){
          return item.show === true ;
         });
        currentPosition.innerHTML = numberShown.length;
      }
  }

  /* вспливаюча підсказка*/
   
  function popupTooltip(){
    if(!('ontouchstart' in window)){
      var listTagsWithTitle = document.querySelectorAll(".tag-with-title");
      var titleText = document.createElement("div");
      titleText.className = "title-text";
      for(var i = 0; i < listTagsWithTitle.length; i++){
        listTagsWithTitle[i].addEventListener("mouseover",function(){
          /* координати тегу для title */
          var coorTagWithTitle = this.getBoundingClientRect();
          /**/
          var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          /* ширина тегу з підсказкою*/
          var widthTagWithTitle = coorTagWithTitle.right - coorTagWithTitle.left;
          var titleTextNew = titleText.cloneNode(true);
          titleTextNew.innerHTML = this.getAttribute('data-title');
          body.appendChild(titleTextNew);
          var coorTitleTextNew = titleTextNew.getBoundingClientRect();
          /* висота title */
          var heightTitleTextNew =coorTitleTextNew.bottom - coorTitleTextNew.top;
          /* ширина title */
          var widthTitleTextNew = coorTitleTextNew.right - coorTitleTextNew.left;
          titleTextNew.style.top = ((coorTagWithTitle.top + scrollTop) - (heightTitleTextNew + 5)) + "px";
          titleTextNew.style.left =(coorTagWithTitle.left + (widthTagWithTitle / 2)) - widthTitleTextNew/2 + "px";
          
        });
        
        listTagsWithTitle[i].addEventListener("mouseout",function(event){
          var titleText = document.querySelector(".title-text");
          body.removeChild(titleText);
        });
        
      }
    }
  }

  /* передача інформації( цитата,автор,src,alt, ітд) з обєкту в html */
  function getTransmissionInformation(list){
    blockquote.innerHTML = list[index].blockquote;
    blockquote.id = list[index].id;
    cite.innerHTML = list[index].author;
    photoAuthor.src = list[index].src;
    photoAuthor.alt = list[index].alt;
    list[index].show = true;
    preferenceCount.innerHTML = list[index].preference;
  }

  /* коли відфільтроаний список=0 змінюю значення show та формую новий 
  відфільтрований список з врахуванням seelect.value*/
  function changeValueShow(){
    if(listFilter.length == 0 && select.value === "Всі автори"){
        list.forEach(function(item){
          item.show = false;
        });
        listFilter = list;
      }
      else if(listFilter.length == 0 ){
        for (var i = 0; i < list.length; i++){
          if( select.value === list[i].author){
            list[i].show = false;
            listFilter.push(list[i]);
          }
        }
      }
  }

   /* обробка події на кнопці наступна та select */
  function processingEvent(){
    /* формування нового списку при зміні автора ,при переході до наступної цитати*/
    getFilteredList(select.value);
    /* коли відфільтроаний список=0 змінюю значення show та формую новий 
    відфільтрований список з врахуванням seelect.value*/
    changeValueShow();
    /* визначення випадкового числа яке використовую як індекс*/
    index = getRandomInt(0,listFilter.length - 1);
    /* передача інфо з масиву в html цитата,alt,src,автор*/
    getTransmissionInformation(listFilter);
    /* кількість показаних та загальна к-сть цитат оновлення інфо в html*/
    getInfoCurrentPosition();
  }


 
});

/* після повного завантаження сторінки в незалежності від результату відповіді від серверу
видаляю overlayLoader */
window.addEventListener("load",function(){
  /* контейнер для loader */
  var overlayLoader = document.querySelector(".overlay-loader");
  /* додавання класу для анімації loader*/
  overlayLoader.classList.add("overlay-loader-hide");
  /* після закінчення анімації(opacity:0) видаляю overlayLoader з сторінки */
  setTimeout(deleteLoader,1000);

  /* після закінчення завантаження сторінки видаляємо overlayLoader 
   з врахуванням transition в .overlay-loader*/
  function deleteLoader(){
    var body = document.querySelector("body");
    body.removeChild(overlayLoader);
  }
});



