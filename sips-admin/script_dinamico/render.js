$(function() {
      array_id["textbox"] = 0;
      array_id["radio"] = 0;
      array_id["checkbox"] = 0;
      array_id["multichoice"] = 0;
      update_script();


});


var array_id = [];

function insert_element(opcao, element, data)
{

      switch (opcao)
      {
            case "texto":
                  element.find(".label_geral")[0].innerHTML = data.texto;
                  element.find(".input_texto")[0].placeholder = data.placeholder;
                  element.find(".input_texto")[0].maxLength = data.max_length;
                  break;

            case "password":
                  element.find(".label_geral")[0].innerHTML = data.texto;
                  element.find(".input_texto_password")[0].placeholder = data.placeholder;
                  element.find(".input_texto_password")[0].maxLength = data.max_length;
                  break;

            case "radio":
                  element.empty();
                  element.append($("<div>").addClass("radio_class item form-inline"));
                  element = element.find(".radio_class");
                  element.append($("<label>").addClass("label_radio label_geral").text($("#radio_edit").val()));
                  element.append($("<br>"));
                  element.find(".label_radio")[0].innerHTML = data.texto;

                  var radios = data.values_text.split(",");
                  for (var count = 0; count < radios.length; count++)
                  {
                        element.append($("<input>")
                                .attr("type", "radio")
                                .attr("value", count + 1)
                                .attr("id", array_id["radio"] + "radio")
                                .attr("name", data.id + "group"));
                        element.append($("<label>")
                                .addClass("radio_name")
                                .attr("for", array_id["radio"] + "radio")
                                .text(radios[count])
                                .append($("<span>")));

                        if (data.dispo === "v")
                              element.append($("<br>"));

                        array_id["radio"] = array_id["radio"] + 1;
                  }
                  break;
                  
            case "checkbox":
                  element.empty();
                  element.append($("<div>").addClass("checkbox_class item form-inline"));

                  element = element.find(".checkbox_class");
                  element.append($("<label>").addClass("label_checkbox label_geral").text($("#checkbox_edit").val()));
                  element.append($("<br>"));
                  element.find(".label_checkbox")[0].innerHTML = data.texto;
                  var checkboxs = data.values_text.split(",");
                  for (var count = 0; count < checkboxs.length; count++)
                  {
                        element.append($("<input>").attr("type", "checkbox").attr("value", count + 1).attr("id", array_id["checkbox"] + "checkbox").attr("name", data.id));
                        element.append($("<label>").addClass("checkbox_name").attr("for", array_id["checkbox"] + "checkbox").text(checkboxs[count]).append($("<span>")));
                        if (data.dispo === "v")
                              element.append($("<br>"));
                        array_id["checkbox"] = array_id["checkbox"] + 1;
                  }
                  break;
                  
            case "multichoice":
                  element.empty();
                  element.append($("<label>").addClass("label_multichoice label_geral").text($("#multichoice_edit").val()));
                  element.find(".label_multichoice")[0].innerHTML = data.texto;
                  var multichoices = data.values_text.split(",");
                  element.append("<select class = 'multichoice_select' > < /select>");
                  var select = element.find(".multichoice_select");
                  for (var count = 0; count < multichoices.length; count++)
                  {
                        select.append("<option value='" + multichoices[count] + "'>" + multichoices[count] + "</option>");
                  }
                  break;
                  
            case "textfield":
                  element.find(".label_geral")[0].innerHTML = data.values_text;
                  break;
                  
            case "tableradio":
                  var tr_head = element.find(".tr_head");
                  tr_head.empty();
                  var titulos = data.texto.split(",");
                  tr_head.append($("<td>").text("*"));
                  for (var count = 0; count < titulos.length; count++)
                  {
                        tr_head.append($("<td>").text(titulos[count]));
                  }
                  var tr_body = element.find(".tr_body");
                  tr_body.empty();
                  var perguntas = data.values_text.split(",");
                  for (var count = 0; count < perguntas.length; count++)
                  {
                        tr_body.append($("<tr>")
                                .append($("<td>").text(perguntas[count]).addClass("td_row")));
                        temp = element.find(".tr_body tr:last");
                        for (var count2 = 0; count2 < titulos.length; count2++)
                        {
                              temp.append($("<td>")
                                      .append($("<input>").attr("type", "radio").attr("id", array_id["radio"] + "tableradio").attr("value", count2 + 1).attr("name", data.id + "" + count))
                                      .append($("<label>").addClass("radio_name").attr("for", array_id["radio"] + "tableradio").append($("<span>"))));
                              array_id["radio"] = array_id["radio"] + 1;
                        }
                  }
                  break;


      }
}



//UPDATES DE INFO
function update_script()
{
      $.post("requests.php", {action: "get_scripts"},
      function(data)
      {

            if (data == null)

            {
                  alert("no data");
            }
            else
            {


                  $("#script_selector").empty();
                  $.each(data, function(index, value) {
                        $("#script_selector").append("<option value=" + data[index].id + ">" + data[index].name + "</option>");
                  });
                  update_pages();
            }
      }, "json");


}
function update_pages()
{


      $.post("requests.php", {action: "get_pages", id_script: $("#script_selector option:selected").val()},
      function(data)
      {
            if (data == null)
            {

                  alert("no page");
            }
            else
            {

                  var pag = $("#page_selector").val();
                  $("#page_selector").empty();
                  $.each(data, function(index, value) {
                        if (pag === data[index].id)
                              $("#page_selector").append("<option value=" + data[index].id + " selected>" + data[index].name + "</option>");
                        else
                              $("#page_selector").append("<option value=" + data[index].id + ">" + data[index].name + "</option>");
                  });
                  update_info();
            }
      }, "json");

}
function update_info()
{


      $.post("requests.php", {action: "get_data", id_script: $("#script_selector option:selected").val(), id_page: $("#page_selector option:selected").val()},
      function(data)
      {
            $.each(data, function(index, value) {
                  $('#dummie').empty();
                  switch (data[index].type)
                  {
                        case "texto":
                              var item = $('#dummie').load('index.html .texto_class', function() {
                                    insert_element("texto", item, data[index]);
                                    item.attr("id", data[index].id)
                                            .data("id", data[index].id)

                                            .data("required", data[index].required)
                                            .data("type", "texto")
                                            .data("grupo", data[index].grupo);

                                    $('#script_div').append(item[0].innerHTML);

                              });
                              break;


                        case "password":
                              var item = $('#dummie').load('index.html .password_class', function() {
                                    insert_element("password", item, data[index]);

                                    item.attr("id", data[index].id)
                                            .data("id", data[index].id)

                                            .data("required", data[index].required)
                                            .data("type", "password")
                                            .data("grupo", data[index].grupo);

                                    $('#script_div').append(item[0].innerHTML);
                              });
                              break;

                        case "radio":
                              var item = $('#dummie').load('index.html .radio_class', function() {
                                    insert_element("radio", item, data[index]);

                                    item.attr("id", data[index].id)
                                            .data("id", data[index].id)

                                            .data("required", data[index].required)
                                            .data("type", "radio")
                                            .data("dispo", data[index].dispo)
                                            .data("grupo", data[index].grupo);

                                    $('#script_div').append(item[0].innerHTML);
                              });
                              break;

                        case "checkbox":
                              var item = $('#dummie').load('index.html .checkbox_class', function() {
                                    insert_element("checkbox", item, data[index]);

                                    item.attr("id", data[index].id)
                                            .data("id", data[index].id)

                                            .data("required", data[index].required)
                                            .data("dispo", data[index].dispo)
                                            .data("grupo", data[index].grupo)
                                            .data("type", "checkbox");

                                    $('#script_div').append(item[0].innerHTML);
                              });
                              break;

                        case "multichoice":
                              var item = $('#dummie').load('index.html .multichoice_class', function() {
                                    insert_element("multichoice", item, data[index]);

                                    item.attr("id", data[index].id)
                                            .data("id", data[index].id)

                                            .data("required", data[index].required)
                                            .data("type", "multichoice")
                                            .data("grupo", data[index].grupo);

                                    $('#script_div').append(item[0].innerHTML);
                              });
                              break;

                        case "textfield":
                              var item = $('#dummie').load('index.html .textfield_class', function() {
                                    insert_element("textfield", item, data[index]);
                                    item.attr("id", data[index].id)
                                            .data("id", data[index].id)

                                            .data("required", data[index].required)
                                            .data("type", "textfield")
                                            .data("grupo", data[index].grupo);

                                    $('#script_div').append(item[0].innerHTML);
                              });
                              break;

                        case "tableradio":
                              var item = $('#dummie').load('index.html .tableradio_class', function() {
                                    insert_element("tableradio", item, data[index]);
                                    item.attr("id", data[index].id)
                                            .data("id", data[index].id)

                                            .data("required", data[index].required)
                                            .data("type", "tableradio")
                                            .data("grupo", data[index].grupo);

                                    $('#script_div').append(item[0].innerHTML);
                              });
                              break;


                  }



            });
            $("#dummie").remove();
      }, "json");




}



$("#search_script").click(function()
{
      get_data();

});

function get_data()
{
      $.post("requests.php", {action: "get_data", id_script: $("#script_selector option:selected").val(), id_page: $("#page_selector option:selected").val()},
      function(data)
      {

            $.each(data, function(index, value) {
                  switch (data[index].type)
                  {
                        case "texto":
                              var item = $('.rightDiv .texto_class').clone();

                              insert_element("texto", item, data[index]);
                              item.attr("id", data[index].id)
                                      .data("id", data[index].id)

                                      .data("required", data[index].required)
                                      .data("type", "texto")
                                      .data("grupo", data[index].grupo);
                              item.appendTo('.script_div');
                              break;

                        case "password":
                              var item = $('.rightDiv .password_class').clone();
                              insert_element("password", item, data[index]);

                              item.attr("id", data[index].id)
                                      .data("id", data[index].id)

                                      .data("required", data[index].required)
                                      .data("type", "password")
                                      .data("grupo", data[index].grupo);
                              item.appendTo('.script_div');
                              break;

                        case "radio":
                              var item = $('.rightDiv .radio_class').clone();
                              insert_element("radio", item, data[index]);

                              item.attr("id", data[index].id)
                                      .data("id", data[index].id)

                                      .data("required", data[index].required)
                                      .data("type", "radio")
                                      .data("dispo", data[index].dispo)
                                      .data("grupo", data[index].grupo);

                              item.appendTo('.script_div');
                              break;

                        case "checkbox":
                              var item = $('.rightDiv .checkbox_class').clone();
                              insert_element("checkbox", item, data[index]);

                              item.attr("id", data[index].id)
                                      .data("id", data[index].id)

                                      .data("required", data[index].required)
                                      .data("dispo", data[index].dispo)
                                      .data("grupo", data[index].grupo)
                                      .data("type", "checkbox");

                              item.appendTo('.script_div');
                              break;

                        case "multichoice":
                              var item = $('.rightDiv .multichoice_class').clone();
                              insert_element("multichoice", item, data[index]);

                              item.attr("id", data[index].id)
                                      .data("id", data[index].id)

                                      .data("required", data[index].required)
                                      .data("type", "multichoice")
                                      .data("grupo", data[index].grupo);

                              item.appendTo('.script_div');
                              break;

                        case "textfield":
                              var item = $('.rightDiv .textfield_class').clone();
                              insert_element("textfield", item, data[index]);
                              item.attr("id", data[index].id)
                                      .data("id", data[index].id)

                                      .data("required", data[index].required)
                                      .data("type", "textfield")
                                      .data("grupo", data[index].grupo);

                              item.appendTo('.script_div');
                              break;

                        case "tableradio":
                              var item = $('.rightDiv .tableradio_class').clone();
                              insert_element("tableradio", item, data[index]);
                              item.attr("id", data[index].id)
                                      .data("id", data[index].id)

                                      .data("required", data[index].required)
                                      .data("type", "tableradio")
                                      .data("grupo", data[index].grupo);

                              item.appendTo('.script_div');
                              break;
                  }
            });

      }, "json");
}