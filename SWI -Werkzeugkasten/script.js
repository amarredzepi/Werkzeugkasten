//Globale Variablen werden hier definiert

var reservierungszeitraum = 0;
var latitude = 0;
var longitude = 0;
var warenkrbleer = true;

// Dynamische Generieren der "Cards" für jedes Werkzeug, welches in einem Container im HTMl-Code eingefügt wird

$.getJSON('http://matthiasbaldauf.com/swi1hs19/tools', function (id) {
  console.log(id); // Verhalten bei Erfolg; Die Daten sollen in der Console angezeigt werden
  var werkz = '';
  $.each(id, function (index, id) {
    werkz += '<div class="col-xs-12 col-sm-12 col-lg-4 order-lg-4" id="werkzcard">'
    werkz += '<img class="card-img-top" src="http://matthiasbaldauf.com/swi1hs19/' + id.img + '">'
    werkz += '<div class="card-body" id="werkzeuge" value="' + id + '">'
    werkz += '<p class="card-title werkzeugnamedeutsch" id="de">' + id["label-de"] + '</p>'
    werkz += '<p class="card-title werkzeugnameenglish" id="eng">'+ id["label-en"] + '</p>'
    werkz += '<p class="card-stock werkzeugbestand" value="' + id.stock + '">' + "Bestand: " + id.stock + " Stk." + '</p>'
    werkz += '<p class="card-prize" id="' + id["price-chf"] + '">' + "Preis: " + id["price-chf"] + " CHF" + '</p>'

    //Falls das Werkzeug keinen Bestand aufweist, generiert es den Code, welcher den Input "disabled", ansosnten einen lauffähigen Input generiert

    if (id.stock == 0) {
      werkz += '<input class="col-xs-12 col-sm-12 col-lg-12" type="number" placeholder="Kein Werkzeug im Lager" disabled style="box-shadow:0 0 5px red">'
    }
    else {
      werkz += '<label for="example-text-input" class="col-xs-4 col-sm-4 col-lg-6" id="textbestellen">Bestellen: </label>'
      werkz += '<input class="inputBestellen col-xs-8 col-sm-8 col-lg-6" type="number" min="1" name="' + id.id + '">'
      
    }
    werkz += '</div>'
    werkz += '</div>'
  });
  $(".werkzg").append(werkz); //Anschliessend append in die Werkzeuglist im HTML
})

// Projektdaten werden von der URL abgerufen und dymanisch in den Optionen der "Projektauswahl eingefügen"

$.getJSON('http://matthiasbaldauf.com/swi1hs19/projects', function (label) {
  console.log(label);
  var project = '';
  $.each(label, function (index, label) {
    project += '<option value="' + label.id + '" name="projid">' + label.label + '</option>'
  });
  $(".projekte").append(project);
});

//Hier wird der Euro-Kurs von exchangerateio.api abgerufen, welcher für den Kostenrechner benötigt wird

var devisen;
$.getJSON('https://api.exchangeratesapi.io/latest?base=CHF', function (base) {
  devisen = base.rates.EUR;
  console.log(devisen);
})

//Funktionalität für die korrekte Datumeingabe "Reservation von:"

$(document).ready(function () {
  var date_input = $('input[id="reservationvon"]');
  var container = $('.bootstrap').length > 0 ? $('.bootstrap').parent() : "body";
  var options = {
    format: 'yyyy-mm-dd',
    container: container,
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options);

  //Funktionalität für die korrekte Datumeingabe "Reservation bis:"

  var date_input = $('input[id="reservationbis"]');
  var container = $('.bootstrap').length > 0 ? $('.bootstrap').parent() : "body";
  var options = {
    format: 'yyyy-mm-dd',
    container: container,
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options);
});

$(document).on('change', '.inputBestellen', function () {

  kosten($(this).attr('name'), $(this).val());

});

// Hier ist die Funktionalität des Button für Deutsch dokumentiert

$('#deutsch').click( function() {
  $('.werkzeugnamedeutsch').show();
  $('.werkzeugnameenglish').hide();
})

// Hier ist die Funtionalität für den Button zur Englischen Umstellung der Sprache
// Ich habe im CSS die englisch Bezeichnung als hidden dargestellt, deshalb brauchte ich eine zusätzlich Funktion "zeigeElement" die mir dann die englischen Begriffe sauber zeigt

$("#english").click( function() {
  zeigeElement();
  $('.werkzeugnamedeutsch').hide();
})

// Funktion für das erfolgreiche Zeigen der englischen Begriffe (im CSS wird die visablility und der display geändert)

function zeigeElement() {
    $.each($('.werkzeugnameenglish'), function (index, eng) {
    eng.style.visibility = "visible";
    eng.style.display = "block";
    })
}
//Die Funktion "kosten" fügt alle reservierten Werkzeug in den Kostenrechner

// Generierung Kostenrechner Start

function kosten(id, quantity) {
  warenkrbleer = true;
  var warenkorb = '';
    totalCHF = 0;
    totalEUR = 0;
    $("#Warenkorb-Collapse").empty()
    if(quantity!=='0') {
      

        //Hier wird die oberste Reihe für die Überschrift erstellt, welche von Anfang an ersichtlich ist
        warenkorb += '<label for="example-text-input" id="listtitel">Berechnung in CHF </label>'
        warenkorb += '<div class="row" id=titelkostenrechner>'
        warenkorb += '<div class="col-3" id="werkzeugbez">Werkzeugname</div>'
        warenkorb += '<div class="col-3 d-flex justify-content-end" id="werkzeugbez">Anzahl</div>'
        warenkorb += '<div class="col-3 d-flex justify-content-end" id="werkzeugbez">Preis pro Werkzeug in CHF</div>'
        warenkorb += '<div class="col-3 d-flex justify-content-end" id="werkzeugbez">Total</div>'
        warenkorb += '</div>'
        
      $('.inputBestellen').each(function (index) {
        if($(this).val() !== '' && $(this).val()!=='0'){
        //Hier werden dynamisch im Kostenrechner alle Elemente eingefügt, welche einen Eintrag im inputBestellen haben
        warenkorb += '<div class="row" id="' + id + '">'
        
        warenkorb += '<input hidden name="' + $(this).attr("name") + '" value="' + $(this).val() + '">' //Mithilfe des "hidden input" werden zusätzlich die ID und die Stückzahl in der Postmethode übergeben
    
        var z = document.getElementById('eng');
        var y = document.getElementById('de');
        console.log(z)
        console.log(y)
        if ((z.style.display === "" && y.style.display === "") || y.style.display === "") { //Hier wird geprüft welche Sprache ausgewählt wurde mithilfe des display, ob dieser definiert ist oder "" ist

        warenkorb += '<div class="col-3">' + $(this).prev().prev().prev().prev().prev().text() + '</div>'
        }
        else {
        warenkorb += '<div class="col-3">' + $(this).prev().prev().prev().prev().text() + '</div>'
        }
        warenkorb += '<div class="col-3 d-flex justify-content-end">' + $(this).val() + ' Stk.</div>'
        warenkorb += '<div class="col-3 d-flex justify-content-end">' + new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format($(this).prev().prev().attr('id')) + ' </div>'

        var zwischentotalCHF = $(this).prev().prev().attr('id') * $(this).val();
        warenkorb += '<div class="col-3 d-flex justify-content-end" id="zwtot" value="' + zwischentotalCHF.toFixed(2) + '">' + new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(zwischentotalCHF) + '</div>'
        warenkorb += '</div>'
        totalCHF += zwischentotalCHF;

        warenkrbleer = false;
        }
          else{
      $(id).remove()
    }
        })
        anezeigeDatTot();

        warenkorb += '<label for="example-text-input" id="listtitel">Berechnung in EUR </label>'
        warenkorb += '<div class="row" id=titelkostenrechner>'
        warenkorb += '<div class="col-3" id="werkzeugbez">Werkzeugname</div>'
        warenkorb += '<div class="col-3 d-flex justify-content-end" id="werkzeugbez">Anzahl</div>'
        warenkorb += '<div class="col-3 d-flex justify-content-end" id="werkzeugbez">Preis pro Werkzeug in EUR</div>'
        warenkorb += '<div class="col-3 d-flex justify-content-end" id="werkzeugbez">Total</div>'
        warenkorb += '</div>'

      $('.inputBestellen').each(function (index) {
        if ($(this).val() !== '' && $(this).val()!=='0') {
        //Hier werden dynamisch im Kostenrechner alle Elemente eingefügt, welche einen Eintrag im inputBestellen haben

        warenkorb += '<div class="row" id="'+id+'">'

        var z = document.getElementById('eng');
        var y = document.getElementById('de');
        if ((z.style.display === "" && y.style.display === "") || y.style.display === "") { //Hier wird geprüft welche Sprache ausgewählt wurde mithilfe des display, ob dieser definiert ist oder "" ist
        warenkorb += '<div class="col-3">' + $(this).prev().prev().prev().prev().prev().text() + '</div>'
        }
        else{
        warenkorb += '<div class="col-3">' + $(this).prev().prev().prev().prev().text() + '</div>'
        }
        warenkorb += '<div class="col-3 d-flex justify-content-end">' + $(this).val() + ' Stk.</div>'
        warenkorb += '<div class="col-3 d-flex justify-content-end">' + new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format($(this).prev().prev().attr('id') * devisen) + '</div>'

        var zwischentotalEUR = $(this).prev().prev().attr('id') * $(this).val() * devisen;
        warenkorb += '<div class="col-3 d-flex justify-content-end" id="zwtot" value="">' + new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(zwischentotalEUR) + '</div>'
        warenkorb += '</div>'
        totalEUR += zwischentotalEUR;
        }
        else{
      $(id).remove()
  }
  })

        
  anezeigeDatTot();
        
  
  //Hier wird die Logik für die korrekte Berechnung des Zeitraum definiert 
  //--> der Zeitraum wird dann mit dem Totalbetrag der Werkzeuge für die Eurobeträge multipliziert, welcher oben definiert ist
  //Wenn keine Zeitangaben in der Reservation durchgeführt wurden, dann werden Feld mit "Zeitraum fehlt" dargestellt

  // Ziel war es, dass wenn das Datum in Reservationsformular geändert wird, soll das Datum automatisch im Kostenrechner erscheinen
  // Leider wird das angepasste Datum nur übernommen wenn eine Änderung bei der Bestellung in der Werkzeugliste stattfindet (keine anderen Möglichkeiten gefunden)
  // Wenn nätürlich das Datum der Reseservation zuerst ausgefüllt wird und danach werkzeuge reserviert werden, dann funktioniert dies
 

  function anezeigeDatTot() {
    var bis = new Date($('#reservationbis').val())
    var von = new Date($('#reservationvon').val())
    reservierungszeitraum = Math.abs(bis - von)
    reservierungszeitraum = reservierungszeitraum / (1000 * 3600 * 24) + 1;
    warenkorb += '<div class="row "><div class="col-12 d-flex justify-content-end" id="totalwerkz">Totalbetrag Werkzeuge: ' + new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(totalCHF) + '</div></div>'
    if (reservierungszeitraum) {
    warenkorb += '<div class="row "><div class="col-12 d-flex justify-content-end">Anzahl Tage Reservation: ' + reservierungszeitraum + '</div></div>'
    warenkorb += '<div class="row "><div class="col-12 d-flex justify-content-end">Totalbetrag: ' + new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(totalCHF * reservierungszeitraum) + '</div></div>'
    } 
    else {
    warenkorb += '<div class="row "><div class="col-12 d-flex justify-content-end">Anzahl Tage Reservation: Zeitraumangabe fehlt.</div></div>'
    warenkorb += '<div class="row "><div class="col-12 d-flex justify-content-end" id="endbetrag">Totalbetrag: Zeitraumangabe fehlt.</div></div>'
    }
    }

  $("#Warenkorb-Collapse").append(warenkorb);
}

//Logik für den Fall das keine Werkzeuge im Kostenrechner erfasst wurden

else{
  if(quantity =='0'){
    alert("Sie können nicht 0 Werkezeuge bestellen. Bitte korrigieren Sie ihre letzte Eingabe.");
    warenkorb += '<img src="Bilder/wrong.gif" alt="" class="center">'
    $("#Warenkorb-Collapse").append(warenkorb);
  }
  else{
    if(quantity <= $('.werkzeugbestand').val()){
    alert("Sie können nicht mehr als "+ $('.werkzeugbestand').val() +" Werkezeuge bestellen. Bitte korrigieren Sie ihre letzte Eingabe.");
    warenkorb += '<img src="Bilder/wrong.gif" alt="" class="center">'
    $("#Warenkorb-Collapse").append(warenkorb);
  }
}
}
}

// Generierung Kostenrechner Ende

// An dieser Stelle wird die Karte von Leaflet mit den Koordinaten der Schweiz generiert

var mymap;
$('#reservation').click(function () {
  setTimeout(function () {
    mymap = L.map('mapid').setView([46.9510811111111, 8.2], 7); //Hier werden die Koordinaten der Schweiz definiert
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11'
    }).addTo(mymap);
    $('#map').show();
  }, 10)

});


//POST-Methode für das Übertragen der Reservation mittels Formular

$("#meinformular").on('submit', function (event) {

  /*// Versuch mit Regex das Formular zu prüfen, jedoch Lösung von Bootstrap angewendet

  var vorname = document.forms["meinformular"]["inputVorname"].value;
  var nachname = document.forms["meinformular"]["inputName"].value;
  var email = document.forms["meinformular"]["inputEmail"].value;
  var projektauswahl = document.forms["meinformular"]["inputProjektauswahl"].value;
  var regname = /\D+/;
  var rexname = regname.test(nachname);
  var rexvorname = regname.test(vorname)
  var regemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var rexemail = regemail.test(email);
  console.log(nachname.value);

  if(vorname == "" || rexvorname == false) {
    alert("Vorname muss ergänzt und im korrekten Format geschrieben werden");
    }
  if(nachname == "" || rexname == false) {
  alert("Name muss ergänzt und im korrekten Format geschrieben werden");
  }
  if(email == "" || rexemail == false) {
  alert("Email muss ergänzt und im korrekten Format geschrieben werden");
  }
  if(projektauswahl == "") {
  alert("Projektauswahl muss ergänzt werden");
  }
  if(rexvorname == false || rexname == false || rexemail == false || projektauswahl == "") {
    return false;
  }
  else {
    */

  event.preventDefault()
  if (warenkrbleer == true) {
    alert("Warenkorb ist leer!");
    return false;
  }
  else {

    var formData = $('#meinformular').serialize() //Zusammenführen aller relevanten Daten für die Post Methode aus Formular "meinformular" (firstname, lastname, email, projid, comment)

    console.log(formData);
    $.ajax("http://matthiasbaldauf.com/swi1hs19/reservation", {
      method: "POST",
      data: formData,
      success: function (data, textStatus, xhr) {
        alert("Resultat: " + data.message);

        console.log(data) //Test, was im data ausgegeben wird

        // Die dargestellte Karte geht mit der Funktion flyTo auf die Koordinaten aus dem erhaltenen JSON Objekt (pickup: {latitude, lontitude})
        // und mittels einem erstellten Popup wird der Abholungsort visuell gekennzeichnet

        mymap.flyTo([data.pickup.latitude, data.pickup.longitude], 18);

        var popup = L.popup()
        var marker = L.marker([data.pickup.latitude, data.pickup.longitude]).addTo(mymap)
        marker.bindPopup("<b>Bestellung erfolgreich!</b><br>Hier können Sie Ihre Ware abholen.").openPopup()
        return false;
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log(xhr)
          alert("Fehler: " + xhr.responseJSON.message);
      }

    })
  }

  // }

  //Hier wird der Name, der Vorname und die Email im LocalStorage gespeichert

  var iemail = document.getElementById("inputEmail");
  localStorage.setItem("inputEmail", iemail.value);
  var iname = document.getElementById("inputName")
  localStorage.setItem("inputName", iname.value);
  var ivorname = document.getElementById("inputVorname")
  localStorage.setItem("inputVorname", ivorname.value);

}
)

//Hier werden die gespeicherten Elemente im LocalStorage in die Webseite eingefügt

$("#inputEmail").val(localStorage.getItem("inputEmail"));
$("#inputName").val(localStorage.getItem("inputName"));
$("#inputVorname").val(localStorage.getItem("inputVorname"));
