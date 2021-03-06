
function outboundList(today) {

    var totalCalls = 0, talkCalls = 0, totalDrop = 0;
    api.get({datatype: 'calls', type: 'total', timeline: {start: today.format('YYYY-MM-DDT00:00'), end: today.format('YYYY-MM-DDT23:59')}, by: {calls: ['by=hour']}}, function(data) {
        var Call = [], Talk = [], Drop = [];
        $.each(data, function() {
            Call.push([
                this.hour,
                this.calls
            ]);
        });
        $.post('../php/reporting.php', {action: 'total_human'}, function(data) {
            var stats = data.human;
            api.get({datatype: 'calls', type: 'total', timeline: {start: today.format('YYYY-MM-DDT00:00'), end: today.format('YYYY-MM-DDT23:59')}, by: {calls: ['by=hour&status=' + stats.join(',')]}}, function(datas) {
                $.each(datas, function() {
                    Talk.push([
                        this.hour,
                        this.calls
                    ]);
                });
                api.get({datatype: 'calls', type: 'total', timeline: {start: today.format('YYYY-MM-DDT00:00'), end: today.format('YYYY-MM-DDT23:59')}, by: {calls: ['by=hour&status=DROP']}}, function(datas) {
                    $.each(datas, function() {
                        Drop.push([
                            this.hour,
                            this.calls
                        ]);
                    });
                    ////console.log(Call);
                    final = [{data: Call, label: 'Total Calls'}, {data: Talk, label: 'Total Answer Calls'}, {data: Drop, label: 'Total Drop Calls'}];
                    graficos.floatLine('#out1', final);
                });
            });
        }, 'json');
    });
    $('#campaign-table').css('width', '100%');
    $('#campaign-table').dataTable().fnClearTable();
    $('#campaign-table').dataTable({"sPaginationType": "bootstrap",
        "bProcessing": true,
        "bLengthChange": false,
        "bDestroy": true,
        "aaSorting": [[2, "desc"]],
        "aoColumns": [
            {"sTitle": "ID", "sClass": "", "sWidth": "50px", "sType": "string"},
            {"sTitle": "Campaign Designation", "sClass": "", "sWidth": "150px"},
            {"sTitle": "Total Calls", "sClass": "", "sWidth": "50px"},
            {"sTitle": "Total Calls Time", "sClass": "", "sWidth": "50px"},
            {"sTitle": "Total Success", "sClass": "", "sWidth": "50px"},
            {"sTitle": "Success / Hour", "sClass": "", "sWidth": "50px"},
            {"sTitle": "Reach", "sClass": "", "sWidth": "50px"},
            {"sTitle": "Response", "sClass": "", "sWidth": "50px"}],
        "sDom": "<'dt-top-row'Tlf>r<'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-6'i><'col-sm-6 text-right'p>>",
        "oTableTools": {
            "aButtons": [{
                    "sExtends": "collection",
                    "sButtonText": 'Save <span class="caret" />',
                    "aButtons": ["csv", "xls", "pdf"]
                }],
            "sSwfPath": "../js/plugin/datatables/media/swf/copy_csv_xls_pdf.swf"
        },
        "fnInitComplete": function(oSettings, json) {
            $(this).closest('#dt_table_tools_wrapper').find('.DTTT.btn-group').addClass('table_tools_group').children('a.btn').each(function() {
                $(this).addClass('btn-sm btn-default');
            });
        }
    });
    $.post('../php/reporting.php', {action: 'getCampaignStatus'}, function(data) {
        ////console.log(data);
        var hours = {};
        var sucesso = false, util = false;
        if (Object.keys(data.sucesso).length) {
            sucesso = true;
        }
        if (Object.keys(data.util).length) {
            util = true;
        }

        api.get({datatype: 'agent_log', type: 'total', timeline: {start: today.format('YYYY-MM-DDT00:00'), end: today.format('YYYY-MM-DDT23:59')}, by: {calls: ['by=campaign']}}, function(time) {
            $.each(time, function() {
                hours[this.campaign] = this.sum_dead +  this.sum_billable_pause + this.sum_dispo + this.sum_talk + this.sum_wait;
            });
        });
        api.get({datatype: 'campaigns', type: 'datatype'}, function(datas) {
            make(data, function(totalCalls, totalTime, totalSucesso, totalUtil, totalHuman) {
                var ar = [], areWeThereYet = datas.length;

                $.each(datas, function() {
                    var sucesso_hour = 0, reach = 0, response = 0, campaign = '<span class="table-value cursor-pointer" data-oid="' + this.oid + '">' + this.oid + '</span>',
                            calls = 0, time = 0, sucessos = 0;

                    if (sucesso) {
                        if (totalSucesso[this.oid]) {
                            sucessos = totalSucesso[this.oid];
                        }

                        if (totalSucesso[this.oid] && hours[this.oid]) {
                            sucesso_hour = totalSucesso[this.oid] / (hours[this.oid] / 3600);
                        } else {
                            sucesso_hour = 0;
                        }
                    } else {
                        sucesso_hour = 'Undefined';
                        totalSucesso = 'Undefined';
                        //sucesso= 'Undefined';
                    }
                    if (totalUtil[this.oid] && totalCalls[this.oid]) {
                        if (totalUtil[this.oid] > 0 && totalCalls[this.oid] > 0) {
                            reach = totalUtil[this.oid] / totalCalls[this.oid];
                            reach = reach.toFixed(2);
                        } else {
                            reach = 0;
                        }
                    } else {
                        reach = 'Undefined';
                    }
                    if (totalSucesso[this.oid] && totalUtil[this.oid]) {
                        if (totalSucesso[this.oid] && totalUtil[this.oid]) {
                            response = totalSucesso[this.oid] / totalUtil[this.oid];
                            response = response.toFixed(2);
                        }
                    } else {
                        response = 'Undefined';
                    }

                    if (totalCalls[this.oid]) {
                        calls = totalCalls[this.oid];
                    }
                    if (totalTime[this.oid]) {
                        time = totalTime[this.oid];
                    }

                    ar.push([campaign, this.designation, calls, moment().hours(0).minutes(0).seconds(time).format('HH:mm:ss'), sucessos, sucesso_hour.toFixed(2), reach, response]);

                    areWeThereYet--;
                    if (!areWeThereYet) {
                        ////console.log(ar);
                        $('#campaign-table').dataTable().fnClearTable();
                        $('#campaign-table').dataTable().fnAddData(ar);
                    }
                });
            });
        });


        function make(data, callback) {
            console.log(data);
            var totalCalls = {}, totalTime = {}, totalSucesso = {}, totalUtil = {}, totalHuman = {};
            api.get({datatype: 'calls', type: 'total', timeline: {start: today.format('YYYY-MM-DDT00:00'), end: today.format('YYYY-MM-DDT23:59')}, by: {calls: ['by=status,campaign']}}, function(result) {
                var fun = result.length;
                console.log(result);
                $.each(result, function() {

                    var oid = this.campaign;


                    if (!totalCalls[oid]) {
                        totalCalls[oid] = this.calls;
                    } else {
                        totalCalls[oid] = totalCalls[oid] + this.calls;
                    }
                    if (!totalTime[oid]) {
                        totalTime[oid] = this.length;
                    } else {
                        totalTime[oid] = totalTime[oid] + this.length;
                    }

                    if (data.sucesso[oid]) {
                        if (data.sucesso[oid].indexOf(this.status) >= 0) {
                            if (oid == "W00003") {
                                console.log(oid + ' Status: ' + this.status + ' - ' + data.sucesso[oid].indexOf(this.status));
                            }
                            if (!totalSucesso[oid]) {
                                totalSucesso[oid] = this.calls;
                            } else {
                                totalSucesso[oid] = totalSucesso[oid] + this.calls;
                            }
                        }
                    }

                    if (data.util[oid]) {
                        if (data.util[oid].indexOf(this.status) >= 0) {
                            if (!totalUtil[oid]) {
                                totalUtil[oid] = this.calls;
                            } else {
                                totalUtil[oid] = totalUtil[oid] + this.calls;
                            }
                        }
                    }

                    if (data.human[oid]) {
                        if (data.human[oid].indexOf(this.status)>=0) {
                            if (!totalHuman[oid]) {
                                totalHuman[oid] = this.calls;
                            } else {
                                totalHuman[oid] = totalHuman[oid] + this.calls;
                            }
                        }
                    }
                    fun--;
                    ////console.log('fun:' + fun);
                    if (!fun) {
                        // //console.log(totalSucesso)
                        callback(totalCalls, totalTime, totalSucesso, totalUtil, totalHuman);
                        ////console.log(totalCalls);
                        ////console.log(totalSucesso);
                    }
                });
                if (!fun) {
                    callback(totalCalls, totalTime, totalSucesso, totalUtil, totalHuman);
                }
            });
        }
        ;
    }, 'json');



    /*$.post('../php/reporting.php', {action: 'getCampaignStatus'}, function(data) {
     var hours = {};
     var sucesso = false, util = false;
     if (Object.keys(data.sucesso).length) {
     sucesso = true;
     }
     if (Object.keys(data.util).length) {
     util = true;
     }
     
     //http://gonecomplus.dyndns.org:10000/ccstats/v0/total/agent_log/2014-02-20T00:01/2014-02-20T23:59?by=campaign
     api.get({datatype: 'agent_log', type: 'total', timeline: {start: today.format('YYYY-MM-DDT00:00'), end: today.format('YYYY-MM-DDT23:59')}, by: {calls: ['by=campaign']}}, function(time) {
     $.each(time, function() {
     hours[this.campaign] = this.sum_dead + this.sum_pause + this.sum_billable_pause + this.sum_dispo + this.sum_talk + this.sum_wait;
     });
     api.get({datatype: 'campaigns', type: 'datatype'}, function(datas) {
     var ar = [];
     forTheWin(data, ar, sucesso, util, datas, hours, function(back) {
     $('#campaign-table').dataTable().fnAddData(back);
     });
     });
     });
     }, 'json');
     function forTheWin(data, ar, sucesso, util, datas, hours, callback) {
     ////console.log(data);
     var areWeThereYet = datas.length;
     $.each(datas, function() {
     var campaign = '<span class="table-value cursor-pointer" data-oid="' + this.oid + '">' + this.oid + '</span>', id = this.oid, designation = this.designation;
     var totalCalls = 0, totalSucesso = 0, totalUtil = 0, totalTime = 0, sucesso_hour = 0, reach = 0, response = 0, id = this.oid, totalHuman = 0;
     api.get({datatype: 'calls', type: 'total', timeline: {start: today.format('YYYY-MM-DDT00:00'), end: today.format('YYYY-MM-DDT23:59')}, by: {calls: ['by=status&campaign=' + this.oid]}}, function(result) {
     $.each(result, function() {
     totalCalls = totalCalls + this.calls;
     totalTime = totalTime + this.length;
     if (data.sucesso[id]) {
     if (data.sucesso[id].indexOf(this.status) >= 0) {
     totalSucesso = totalSucesso + this.calls;
     }
     }
     if (data.util[id]) {
     if (data.util[id].indexOf(this.status) >= 0) {
     totalUtil = totalUtil + this.calls;
     }
     }
     if (data.human[id]) {
     if (data.human[id].indexOf(this.status) >= 0) {
     totalHuman = totalHuman + this.calls;
     }
     }
     });
     if (sucesso) {
     if (totalSucesso > 0 && hours[id] > 0) {
     sucesso_hour = totalSucesso / (hours[id] / 3600);
     sucesso_hour = sucesso_hour.toFixed(2);
     } else {
     sucesso_hour = 0;
     }
     
     } else {
     sucesso_hour = 'Undefined';
     totalSucesso = 'Undefined';
     }
     if (util) {
     if (totalUtil > 0 && totalCalls > 0) {
     reach = totalUtil / totalHuman;
     reach = reach.toFixed(2);
     } else {
     reach = 0;
     }
     
     } else {
     reach = 'Undefined';
     }
     if (sucesso && util) {
     if (totalSucesso > 0 && totalUtil > 0) {
     response = totalSucesso / totalUtil;
     response = response.toFixed(2);
     } else {
     response = 0;
     }
     } else {
     response = 'Undefined';
     }
     
     ar.push([campaign, designation, totalCalls, moment().hours(0).minutes(0).seconds(totalTime).format('HH:mm:ss'), totalSucesso, sucesso_hour, reach, response]);
     areWeThereYet--;
     if (!areWeThereYet) {
     callback(ar);
     }
     
     });
     });
     }*/


    $.post('../php/reporting.php', {action: 'agents'}, function(data) {
        $('#outbound-line2').html(data.agents.count + ' / ' + data.total.count);
        $('#outbound-bar-2').css('width', Math.round((data.agents.count * 100) / data.total.count) + '%');
    }, 'json');
    $.post('../php/reporting.php', {action: 'total_human'}, function(data) {
        var status = data.human;
        api.get({datatype: 'calls', type: 'total', timeline: {start: today.format('YYYY-MM-DDT00:00'), end: today.format('YYYY-MM-DDT23:59')}, by: {calls: ['by=status']}}, function(datas) {
            $.each(datas, function() {
                totalCalls += this.calls;
                if (status.indexOf(this.status) >= 0) {
                    talkCalls += this.calls;
                }
            });
            $('#outbound-line1').html(talkCalls + ' / ' + totalCalls);
            $('#outbound-bar-1').css('width', Math.round((talkCalls * 100) / totalCalls) + '%');
            api.get({datatype: 'contacts', type: 'count', by: {calls: ['by=day,month,year,status&year=' + today.format('YYYY') + '&month=' + today.format('MM') + '&day=' + today.format('DD')]}}, function(data) {
                $.each(data, function() {
                    if (this._id.status.oid === 'DROP') {
                        totalDrop = this.count;
                    }
                });
                $('#outbound-line3').html(totalDrop + ' / ' + totalCalls);
                $('#outbound-bar-3').css('width', Math.round((totalDrop * 100) / totalCalls) + '%');
            });
        });
    }, 'json');
    $.post('../php/reporting.php', {action: 'allCampaigns'}, function(data) {
        $('#outbound-line4').html(data.active.count + ' / ' + data.total.count);
        $('#outbound-bar-4').css('width', Math.round((data.active.count * 100) / data.total.count) + '%');
    }, 'json');
    $.post('../php/reporting.php', {action: 'db'}, function(data) {
        $('#outbound-line5').html(data.active.count + ' / ' + data.total.count);
        $('#outbound-bar-5').css('width', Math.round((data.active.count * 100) / data.total.count) + '%');
    }, 'json');
}

function outbound_by(start, end, callback) {
    var minuto, hora, dias, semanas, mes, ano, a, b;
    if (start === '' && end === '') {
        api.get({'datatype': 'calls', 'type': 'total', timeline: {start: '1010-01-01T00:00', end: '3020-01-01T00:00'}}, function(data) {
            $.each(data, function() {
                end = this.max_stamp;
                start = this.min_stamp;
            });
            a = moment(end);
            b = moment(start);
            minuto = a.diff(b, 'minutes');
            hora = a.diff(b, 'hours');
            dias = a.diff(b, 'days');
            semanas = a.diff(b, 'weeks');
            mes = a.diff(b, 'month');
            ano = a.diff(b, 'year');
            if (minuto < 60) {
                by = 'by_minute';
                end = end.substr(0, 11) + '23:59';
                start = start.substr(0, 11) + '00:00';
            } else if (hora < 24) {
                by = 'by_hour';
                end = end.substr(0, 11) + '23:59';
                start = start.substr(0, 11) + '00:00';
            } else if (dias < 31) {
                by = 'by_day';
                end = end.substr(0, 11) + '23:59';
                start = start.substr(0, 11) + '00:00';
            } else if (mes < 13) {
                by = 'by_month';
                end = end.substr(0, 11) + '23:59';
                start = start.substr(0, 11) + '00:00';
            } else if (ano < 4) {
                by = 'by_year';
                end = end.substr(0, 11) + '23:59';
                start = start.substr(0, 11) + '00:00';
            }

            callback(by, start, end, hora);
        });
    } else {

        a = moment(end);
        b = moment(start);
        minuto = a.diff(b, 'minutes');
        hora = a.diff(b, 'hours');
        dias = a.diff(b, 'days');
        semanas = a.diff(b, 'weeks');
        mes = a.diff(b, 'month');
        ano = a.diff(b, 'year');
        if (minuto < 60) {
            by = 'by_minute';
        } else if (hora < 24) {
            by = 'by_hour';
        } else if (dias < 31) {
            by = 'by_day';
            end = end.substr(0, 11) + '23:59';
            start = start.substr(0, 11) + '00:00';
        } else if (mes < 13) {
            by = 'by_month';
            end = end.substr(0, 11) + '23:59';
            start = start.substr(0, 11) + '00:00';
        } else if (ano < 4) {
            by = 'by_year';
            end = end.substr(0, 11) + '23:59';
            start = start.substr(0, 11) + '00:00';
        }

        callback(by, start, end, hora);
    }
}

function outbound(start, end, CampaignID, campaigns, statuses, agents, databases) {
    outbound_by(start, end, function(by, start, end, hora) {
        $('#feedback-details').hide();
        $('#agents-details').hide();
        $('#pausa-details').hide();
        api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['campaign=' + CampaignID]}}, function(data) {
            if (data.length) {
                $('#outbound .jarviswidget').show();
                $('#outbound').fadeIn(400, function() {
                    $('#outbound-campaign-title').html('<h6> ' + CampaignID + ' - ' + campaigns[CampaignID] + '</h6>');
                    initialize();
                    performance(CampaignID, start, end);
                    agentsOut(CampaignID, start, end, agents);
                    feedbacks(CampaignID, start, end, statuses);
                    total(CampaignID, start, end);
                    timeline(CampaignID, start, end);
                    hour(CampaignID, start, end);
                    pause(CampaignID, start, end, agents);
                    exportsOut(CampaignID, start, end, agents);
                    $('#outbound').on('click', '#btn-out-timeline', function() {
                        $('#btn-out-timeline-ok').show();
                        $(this).hide();
                        graficos.floatLine('#example3', []);
                        $('#out-time-active').show();
                        $('#out-time-inactive').hide();
                        $('#out-timeline-legendas i').css('color', '#FAFAFA');
                    });
                    $('#outbound').on('click', '#btn-out-timeline-ok', function() {
                        ar = ['1'], color = ['#57889C', '#356e35', '#990329', '#FF6103', '#c79121', '#360068a0', '#d9ce00', '#519c00', '#FF00B3'], final = [], talk = [], totals = [], drop = [];
                        $('#btn-out-timeline').show();
                        $(this).hide();
                        final = [];
                        $('#out-time-active').hide();
                        $('#out-time-inactive').show();
                        var all = $('#out-time-active input[type="checkbox"]:checked');
                        ////console.log(all);
                        if (!all) {
                            $('#example3_select').fadeIn();
                        } else {
                            $('#example3_select').fadeOut();
                            $.each(all, function(index, value) {
                                ar.push($(this).data().txt);
                                $('#out-time-' + $(this).data().txt + ' i').css('color', color[index]);
                            });
                            $.post('../php/reporting.php', {action: 'timeline', id: CampaignID, dados: ar, start: start, end: end}, function(data) {
                                var win = ar.length;
                                $.each(ar, function(key, val) {
                                    //////console.log(key + '-' + val);
                                    if (val === 'total') {
                                        final.push({label: 'Total Calls', data: data.Total});
                                    }
                                    if (val === 'talk') {
                                        final.push({label: 'Total Answer Calls', data: data.Talk});
                                    }
                                    if (val === 'drop') {
                                        final.push({label: '.Total Drop Calls', data: data.Drop});
                                    }
                                    if (val === 'util') {
                                        final.push({label: 'Total Positive Calls', data: data.Util});
                                    }
                                    if (val === 'sucesso') {
                                        final.push({label: 'Total Success Calls', data: data.Sucesso});
                                    }
                                    if (val === 'callback') {
                                        final.push({label: 'Total Callback Calls', data: data.Callback});
                                    }
                                    if (val === 'complete') {
                                        final.push({label: 'Total Complete Calls', data: data.Complete});
                                    }
                                    if (val === 'nutil') {
                                        final.push({label: 'Total Negative Calls', data: data.NUtil});
                                    }
                                    if (val === 'unwork') {
                                        final.push({label: 'Total Unworkable Calls', data: data.Unwork});
                                    }

                                    win--;
                                    if (!win) {
                                        //console.log(final);
                                        graficos.floatLine('#example3', final);
                                    }
                                });
                            }, 'json');
                        }
                    });
                    $('#outbound').on('click', '#btn-out-hour', function() {
                        $('#btn-out-hour-ok').show();
                        $(this).hide();
                        graficos.floatBar('#example4', []);
                        $('#out-hour-active').show();
                        $('#out-hour-inactive').hide();
                        $('#out-hour-legendas i').css('color', '#FAFAFA');
                    });
                    $('#outbound').on('click', '#btn-out-hour-ok', function() {
                        ar = ['1'], color = ['#57889C', '#356e35', '#990329', '#FF6103', '#c79121', '#360068a0', '#d9ce00', '#519c00', '#FF00B3'], final = [], talk = [], totals = [], drop = [];
                        $('#btn-out-hour').show();
                        $(this).hide();
                        $('#out-hour-active').hide();
                        $('#out-hour-inactive').show();
                        var all = $('#out-hour-active input[type="checkbox"]:checked');
                        ////console.log(all);
                        if (!all) {
                            $('#example4_select').fadeIn();
                        } else {
                            $('#example4_select').fadeOut();
                            $.each(all, function(index, value) {
                                ar.push($(this).data().txt);
                                $('#out-hour-' + $(this).data().txt + ' i').css('color', color[index]);
                            });
                            $.post('../php/reporting.php', {action: 'hour', id: CampaignID, dados: ar, start: start, end: end}, function(data) {
                                var win = ar.length;
                                $.each(ar, function(key, val) {
                                    if (val === 'total') {
                                        final.push({data: data.Total, bars: {show: true, barWidth: 0.2, order: key}});
                                    }
                                    if (val === 'talk') {
                                        final.push({data: data.Talk, bars: {show: true, barWidth: 0.2, order: key}});
                                    }
                                    if (val === 'drop') {
                                        final.push({data: data.Drop, bars: {show: true, barWidth: 0.2, order: key}}); //data.Drop
                                    }
                                    if (val === 'util') {
                                        final.push({data: data.Util, bars: {show: true, barWidth: 0.2, order: key}}); //data.Util
                                    }
                                    if (val === 'sucesso') {
                                        final.push({data: data.Sucesso, bars: {show: true, barWidth: 0.2, order: key}}); //data.Sucesso
                                    }
                                    if (val === 'callback') {
                                        final.push({data: data.Callback, bars: {show: true, barWidth: 0.2, order: key}}); //data.Callback
                                    }
                                    if (val === 'complete') {
                                        final.push({data: data.Complete, bars: {show: true, barWidth: 0.2, order: key}}); //data.Complete
                                    }
                                    if (val === 'nutil') {
                                        final.push({data: data.NUtil, bars: {show: true, barWidth: 0.2, order: key}}); //data.Nutil
                                    }
                                    if (val === 'unwork') {
                                        final.push({data: data.Unwork, bars: {show: true, barWidth: 0.2, order: key}}); //data.Unwork
                                    }

                                    win--;
                                    if (!win) {
                                        graficos.floatBar('#example4', final, undefined, '%x - %y ');
                                    }
                                });
                            }, 'json');
                        }
                    });
                    $('#outbound').on('click', '#outbound-feedbacks tr', function() {
                        var status = $(this)[0].cells[0].childNodes[0].dataset.status;
                        $('#feedbacks-details').fadeIn(400, function() {
                            api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=agent&status=' + status + '&campaign=' + CampaignID]}}, function(data) {
                                var ar = [];
                                $('#outbound-feedback-agents').dataTable().fnClearTable();
                                $('#outbound-feedback-agents').dataTable({"sPaginationType": "bootstrap", "bLengthChange": false, "bDestroy": true, "bAutoWidth": true, "aaSorting": [[2, "desc"]],
                                    "sDom": "<'dt-top-row'Tlf>r<'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-6'i><'col-sm-6 text-right'p>>",
                                    "oTableTools": {
                                        "aButtons": [{
                                                "sExtends": "collection",
                                                "sButtonText": 'Save <span class="caret" />',
                                                "aButtons": ["csv", "xls", "pdf"]
                                            }],
                                        "sSwfPath": "../js/plugin/datatables/media/swf/copy_csv_xls_pdf.swf"
                                    },
                                    "fnInitComplete": function(oSettings, json) {
                                        $(this).closest('#dt_table_tools_wrapper').find('.DTTT.btn-group').addClass('table_tools_group').children('a.btn').each(function() {
                                            $(this).addClass('btn-sm btn-default');
                                        });
                                    }});
                                feedbacksAgents(ar, data, CampaignID, start, end, function(back) {
                                    $('#outbound-feedback-agents').dataTable().fnClearTable();
                                    $('#outbound-feedback-agents').dataTable().fnAddData(back);
                                });
                            });
                            api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=database&status=' + status + '&campaign=' + CampaignID]}}, function(data) {
                                var ar = [];
                                $('#outbound-feedback-databases').dataTable().fnClearTable();
                                $('#outbound-feedback-databases').dataTable({"sPaginationType": "bootstrap", "bLengthChange": false, "bDestroy": true, "bAutoWidth": true, "aaSorting": [[2, "desc"]],
                                    "sDom": "<'dt-top-row'Tlf>r<'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-6'i><'col-sm-6 text-right'p>>",
                                    "oTableTools": {
                                        "aButtons": [{
                                                "sExtends": "collection",
                                                "sButtonText": 'Save <span class="caret" />',
                                                "aButtons": ["csv", "xls", "pdf"]
                                            }],
                                        "sSwfPath": "../js/plugin/datatables/media/swf/copy_csv_xls_pdf.swf"
                                    },
                                    "fnInitComplete": function(oSettings, json) {
                                        $(this).closest('#dt_table_tools_wrapper').find('.DTTT.btn-group').addClass('table_tools_group').children('a.btn').each(function() {
                                            $(this).addClass('btn-sm btn-default');
                                        });
                                    }});
                                feedbacksDB(ar, data, function(back) {
                                    $('#outbound-feedback-databases').dataTable().fnClearTable();
                                    $('#outbound-feedback-databases').dataTable().fnAddData(back);
                                });
                            });
                        });
                    });
                    $('#outbound').on('click', '#outbound-agents tr', function() {
                        var agent = $(this)[0].cells[0].childNodes[0].dataset.id;
                        var hour = 0;
                        $('#outbound-agents-feedbacks').css('width', '100%');
                        $('#outbound-agens-databases').css('width', '100%');
                        $('#agents-details').fadeIn(600, function() {
                            api.get({datatype: 'agent_log', type: 'total', timeline: {start: start, end: end}, by: {calls: ['campaign=' + CampaignID + '&agent=' + agent]}}, function(data) {
                                hour = data[0].sum_dead + data[0].sum_pause + data[0].sum_billable_pause + data[0].sum_dispo + data[0].sum_talk + data[0].sum_wait;
                                api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=status&agent=' + agent + '&campaign=' + CampaignID]}}, function(data) {
                                    $('#outbound-agents-feedbacks').dataTable().fnClearTable();
                                    $('#outbound-agents-feedbacks').dataTable({"sPaginationType": "bootstrap", "bLengthChange": false, "bDestroy": true, "bAutoWidth": true, "aaSorting": [[2, "desc"]],
                                        "sDom": "<'dt-top-row'Tlf>r<'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-6'i><'col-sm-6 text-right'p>>",
                                        "oTableTools": {
                                            "aButtons": [{
                                                    "sExtends": "collection",
                                                    "sButtonText": 'Save <span class="caret" />',
                                                    "aButtons": ["csv", "xls", "pdf"]
                                                }],
                                            "sSwfPath": "../js/plugin/datatables/media/swf/copy_csv_xls_pdf.swf"
                                        },
                                        "fnInitComplete": function(oSettings, json) {
                                            $(this).closest('#dt_table_tools_wrapper').find('.DTTT.btn-group').addClass('table_tools_group').children('a.btn').each(function() {
                                                $(this).addClass('btn-sm btn-default');
                                            });
                                        }});
                                    var ar = [];
                                    agentsFeedbacks(data, ar, statuses, hour, function(ar) {
                                        $('#outbound-agents-feedbacks').dataTable().fnClearTable();
                                        $('#outbound-agents-feedbacks').dataTable().fnAddData(ar);
                                    });
                                });
                                api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=database&agent=' + agent + '&campaign=' + CampaignID]}}, function(data) {
                                    $('#outbound-agens-databases').dataTable().fnClearTable();
                                    $('#outbound-agens-databases').dataTable({"sPaginationType": "bootstrap", "bLengthChange": false, "bDestroy": true, "bAutoWidth": true, "aaSorting": [[2, "desc"]],
                                        "sDom": "<'dt-top-row'Tlf>r<'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-6'i><'col-sm-6 text-right'p>>",
                                        "oTableTools": {
                                            "aButtons": [{
                                                    "sExtends": "collection",
                                                    "sButtonText": 'Save <span class="caret" />',
                                                    "aButtons": ["csv", "xls", "pdf"]
                                                }],
                                            "sSwfPath": "../js/plugin/datatables/media/swf/copy_csv_xls_pdf.swf"
                                        },
                                        "fnInitComplete": function(oSettings, json) {
                                            $(this).closest('#dt_table_tools_wrapper').find('.DTTT.btn-group').addClass('table_tools_group').children('a.btn').each(function() {
                                                $(this).addClass('btn-sm btn-default');
                                            });
                                        }});
                                    var ar = [];
                                    dbFeedbacks(data, ar, databases, hour, function(back) {
                                        $('#outbound-agens-databases').dataTable().fnClearTable();
                                        $('#outbound-agens-databases').dataTable().fnAddData(back);
                                    });
                                });
                            });
                        });
                    });
                });
            }
            else {
                $('#outbound').hide();
                $.smallBox({
                    title: "Reporting",
                    content: "Date range without information!",
                    color: "#5384AF",
                    timeout: 3600,
                    icon: "fa fa-calendar"
                });
            }
        });
    }
    );
}

function initialize() {
    $('#out-time-total i').css('color', '#57889C');
    $('#out-time-talk i').css('color', '#356E35');
    $('#out-time-drop i').css('color', '#990329');
    $('#out-time-util i').css('color', '#FAFAFA');
    $('#out-time-sucesso i').css('color', '#FAFAFA');
    $('#out-time-callback i').css('color', '#FAFAFA');
    $('#out-time-complete i').css('color', '#FAFAFA');
    $('#out-time-nutil i').css('color', '#FAFAFA');
    $('#out-time-unwork i').css('color', '#FAFAFA');
    $('#out-hour-total i').css('color', '#57889C');
    $('#out-hour-talk i').css('color', '#356E35');
    $('#out-hour-drop i').css('color', '#990329');
    $('#out-hour-util i').css('color', '#FAFAFA');
    $('#out-hour-sucesso i').css('color', '#FAFAFA');
    $('#out-hour-callback i').css('color', '#FAFAFA');
    $('#out-hour-complete i').css('color', '#FAFAFA');
    $('#out-hour-nutil i').css('color', '#FAFAFA');
    $('#out-hour-unwork i').css('color', '#FAFAFA');
    $('#out-hour-active input').prop('checked', false);
    $('#out-time-active input').prop('checked', false);
    $('#out-time-total1 input').prop('checked', true);
    $('#out-hour-total1 input').prop('checked', true);
    $('#out-time-talk1 input').prop('checked', true);
    $('#out-hour-talk1 input').prop('checked', true);
    $('#out-time-drop1 input').prop('checked', true);
    $('#out-hour-drop1 input').prop('checked', true);
}

function performance(CampaignID, start, end) {
    $.post('../php/reporting.php', {action: 'getStatus', id: CampaignID}, function(data) {
        var calls = 0, time = 0, sucesso = 0, dnc = 0, nutil = 0, util = 0, unworkable = 0, callback = 0, complete = 0, first = 0, second = 0, tres = 0, quatro = 0, cinco = 0, seis = 0, horas = 0;
        api.get({datatype: 'agent_log', type: 'total', timeline: {start: start, end: end}, by: {calls: ['campaign=' + CampaignID]}}, function(dat) {
            // //console.log(dat);
            if (dat) {
                horas = dat[0].sum_billable_pause + dat[0].sum_dead + dat[0].sum_dispo + dat[0].sum_talk + dat[0].sum_wait;
                $('#aag6').html((horas / 3600).toFixed(3));
            }
            api.get({datatype: 'calls', type: 'total', 'timeline': {'start': start, 'end': end}, 'by': {'calls': ['campaign=' + CampaignID + '&by=status']}}, function(info) {
                // //console.log(info);
                $.each(info, function() {
                    calls += this.calls;
                    time += moment.duration(this.length, 's').humanize();
                    if (data.Sucesso.indexOf(this.status) >= 0) {
                        sucesso += this.calls;
                    }
                    if (data.DNC.indexOf(this.status) >= 0) {
                        dnc += this.calls;
                    }
                    if (data.NUtil.indexOf(this.status) >= 0) {
                        nutil += this.calls;
                    }
                    if (data.Util.indexOf(this.status) >= 0) {
                        util += this.calls;
                    }
                    if (data.Unworkable.indexOf(this.status) >= 0) {
                        unworkable += this.calls;
                    }
                    if (data.Callback.indexOf(this.status) >= 0) {
                        callback += this.calls;
                    }
                    if (data.Complete.indexOf(this.status) >= 0) {
                        complete += this.calls;
                    }
                });
                first = ((util / complete) * 100) / 1;
                second = ((sucesso / util) * 100) / 1;
                tres = sucesso / (horas / 3600);
                quatro = util / (horas / 3600);
                cinco = nutil / (horas / 3600);
                $('#aag1').html(first.toFixed(3) + ' %');
                $('#aag2').html(second.toFixed(3) + '%');
                $('#aag3').html(tres.toFixed(3));
                $('#aag4').html(quatro.toFixed(3));
                $('#aag5').html(cinco.toFixed(3));
            });
        });
    }, 'json');
}

function agentsOut(CampaignID, start, end, agents) {
    //console.log(agents);
    $.post('../php/reporting.php', {action: 'getAgentsCampaign', id: CampaignID, start: start, end: end}, function(data) {
        $('#outbound-agents').dataTable().fnClearTable();
        $('#outbound-agents').dataTable({"bProcessing": true, "aaSorting": [[3, "desc"]], "sPaginationType": "bootstrap", "bLengthChange": false, "bDestroy": true,
            "sDom": "<'dt-top-row'Tlf>r<'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-6'i><'col-sm-6 text-right'p>>",
            "oTableTools": {
                "aButtons": [{
                        "sExtends": "collection",
                        "sButtonText": 'Save <span class="caret" />',
                        "aButtons": ["csv", "xls", "pdf"]
                    }],
                "sSwfPath": "../js/plugin/datatables/media/swf/copy_csv_xls_pdf.swf"
            },
            "fnInitComplete": function(oSettings, json) {
                $(this).closest('#dt_table_tools_wrapper').find('.DTTT.btn-group').addClass('table_tools_group').children('a.btn').each(function() {
                    $(this).addClass('btn-sm btn-default');
                });
            }});
        $.post('../php/reporting.php', {action: 'agentsCampaign', id: CampaignID, start: moment(start).format('YYYY-MM-DD 00:00:01'), end: moment(end).format('YYYY-MM-DD 23:59:59')}, function(d) {
            var ar = [], d = d.Agents;

            $.each(d, function(i, value) {
                var id = this.agent, name = '<span class="outbound-agents-click cursor-pointer" data-id="' + this.agent + '">' + agents[this.agent] + '</span>', totalTime = 0, totalCalls = 0, totalSucesso = 0, avg = 0, sucesso_hour = 0, reach = 0, response = 0;
                if (data.Calls[this.agent]) {
                    totalCalls = data.Calls[this.agent];
                }
                if (data.Time[this.agent]) {
                    totalTime = data.Time[this.agent];
                }
                if (data.Sucesso[this.agent]) {
                    totalSucesso = data.Sucesso[this.agent];
                }
                if (data.Hour[this.agent] && data.Sucesso[this.agent]) {
                    sucesso_hour = data.Calls[this.agent] / (data.Hour[this.agent] / 3600);
                    sucesso_hour = sucesso_hour.toFixed(3);
                }
                if (data.Util[this.agent] && data.Human[this.agent]) {
                    reach = data.Util[this.agent] / data.Human[this.agent];
                    reach = reach.toFixed(2);
                }
                if (data.Sucesso[this.agent] && data.Util[this.agent]) {
                    response = data.Sucesso[this.agent] / data.Util[this.agent];
                    response = response.toFixed(2);
                }
                if (totalTime / totalCalls > 0) {
                    avg = Math.round(totalTime / totalCalls);
                }
                ar.push([name, id, moment().hours(0).minutes(0).seconds(totalTime).format('HH:mm:ss'), totalCalls, moment().hours(0).minutes(0).seconds(avg).format('HH:mm:ss'), totalSucesso, sucesso_hour, reach, response]);
            });
            $('#outbound-agents').dataTable().fnClearTable();
            $('#outbound-agents').dataTable().fnAddData(ar);
        }, 'json');
    }, 'json');
}

function feedbacks(CampaignID, start, end, statuses) {
    $('#outbound-feedbacks').dataTable().fnClearTable();
    $('#outbound-feedbacks').dataTable({"sPaginationType": "bootstrap", "bLengthChange": false, "bDestroy": true,
        "sDom": "<'dt-top-row'Tlf>r<'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-6'i><'col-sm-6 text-right'p>>",
        "oTableTools": {
            "aButtons": [{
                    "sExtends": "collection",
                    "sButtonText": 'Save <span class="caret" />',
                    "aButtons": ["csv", "xls", "pdf"]
                }],
            "sSwfPath": "../js/plugin/datatables/media/swf/copy_csv_xls_pdf.swf"
        },
        "fnInitComplete": function(oSettings, json) {
            $(this).closest('#dt_table_tools_wrapper').find('.DTTT.btn-group').addClass('table_tools_group').children('a.btn').each(function() {
                $(this).addClass('btn-sm btn-default');
            });
        }});
    api.get({datatype: 'campaign_group_agent', type: 'datatype', 'by': {calls: ['campaign=' + CampaignID]}}, function(data) {
        var totalAgents;
        totalAgents = data.length;
        api.get({datatype: 'agent_log', type: 'total', timeline: {start: start, end: end}, by: {calls: ['campaign=' + CampaignID]}}, function(data) {
            var horas;
            horas = (data[0].sum_dead + data[0].sum_pause + data[0].sum_billable_pause + data[0].sum_dispo + data[0].sum_talk + data[0].sum_wait) / 3600;
            api.get({'datatype': 'calls', 'type': 'total', 'timeline': {'start': start, 'end': end}, 'by': {'calls': ['campaign=' + CampaignID + '&by=status']}}, function(data) {
                var ar = [];
                $.each(data, function() {
                    var feedback, calls, time, name, avg, hours;
                    feedback = '<span class="feedback-id cursor-pointer" data-status="' + this.status + '">' + this.status + "</span>";
                    name = statuses[this.status];
                    calls = this.calls;
                    time = moment().hours(0).minutes(0).seconds(this.length).format('HH:mm:ss');
                    avg = moment().hours(0).minutes(0).seconds(Math.round(this.length / calls)).format('HH:mm:ss'); // Math.round(this.length / calls);
                    hours = this.calls / horas;
                    ar.push([feedback, name, calls, time, avg, hours.toFixed(2)]);
                });
                $('#outbound-feedbacks').dataTable().fnClearTable();
                $('#outbound-feedbacks').dataTable().fnAddData(ar);
            });
        });
    });
}

function total(CampaignID, start, end) {
    $.post('../php/reporting.php', {action: 'getStatus', id: CampaignID}, function(data) {
        var ar = [];
        winTheGoldTotal(data, ar, function(back, at, a) {
            var total = 0;
            api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['campaign=' + CampaignID]}}, function(datas) {
                if (datas.length) {
                    total = datas[0].calls;
                    a++;
                }
                // back.push([a, total]);
                // at.push([a, 'Total Calls']);
                var dataset = [{label: "", data: back, color: "#57889C"}];
                //console.log(dataset);
                graficos.floatBar('#example1', dataset, at, '<span style="display:none;">%x</span> %y Calls');
            });
        });
    }, 'json');
    function winTheGoldTotal(data, ar, callback) {
        var t = 8, a = 0, at = [];
        $.each(data, function(index) {
            if (this.length) {
                var total = 0;
                api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['campaign=' + CampaignID + '&status=' + this.join(',')]}}, function(datas) {
                    if (datas.length) {
                        total = datas[0].calls;
                    }
                    ar.push([a, total]);
                    at.push([a, 'Total ' + index]);
                    a++;
                    t--;
                    if (!t) {
                        callback(ar, at, a);
                    }
                });
            } else {
                t--;
            }
        });
    }
    ;
}

function timeline(CampaignID, start, end) {
    $.post('../php/reporting.php', {action: 'getStatus', id: CampaignID}, function(data) {
        var talk = [], total = [], drop = [], final = [], finalT = [], talkTime = [], totalTime = [], dropTime = [], ticket = [];
        api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=hour&status=' + data.Answer.join(',') + '&campaign=' + CampaignID]}}, function(a) {
            $.each(a, function() {
                talk.push([
                    this.hour,
                    this.calls
                ]);
            });
            api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=hour&status=DROP&campaign=' + CampaignID]}}, function(b) {
                $.each(b, function() {
                    drop.push([
                        this.hour,
                        this.calls
                    ]);
                });
                api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=hour&campaign=' + CampaignID]}}, function(c) {
                    $.each(c, function() {
                        total.push([
                            this.hour,
                            this.calls
                        ]);
                    });
                    final.push({data: total, label: 'Total Calls'}, {data: talk, label: 'Total Answer Calls'}, {data: drop, label: 'Total Drop Calls'});
                    graficos.floatLine('#example3', final);
                });
            });
        });
    }, 'json');
}

function hour(CampaignID, start, end) {
    $.post('../php/reporting.php', {action: 'getStatus', id: CampaignID}, function(data) {
        var talk = [], total = [], drop = [], final = [], finalT = [], talkTime = [], totalTime = [], dropTime = [], ticket = [];
        api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=hour&status=' + data.Answer.join(',') + '&campaign=' + CampaignID]}}, function(a) {
            $.each(a, function() {
                talkTime.push([
                    this.hour,
                    Math.round(this.length / 60)
                ]);
            });
            api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=hour&status=DROP&campaign=' + CampaignID]}}, function(b) {
                $.each(b, function() {
                    dropTime.push([
                        this.hour,
                        Math.round(this.length / 60)
                    ]);
                });
                api.get({datatype: 'calls', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=hour&campaign=' + CampaignID]}}, function(c) {
                    $.each(c, function() {
                        totalTime.push([
                            this.hour,
                            Math.round(this.length / 60)
                        ]);
                    });
                    ////console.log('Total');
                    ////console.log(totalTime);
                    ////console.log('Total Talk');
                    ////console.log(talkTime);
                    ////console.log('Total Drop');
                    ////console.log(dropTime);
                    finalT.push({data: totalTime, bars: {show: true, barWidth: 0.2, order: 1}}, {data: talkTime, bars: {show: true, barWidth: 0.2, order: 2}}); //, {data: dropTime, bars: {show: true, barWidth: 0.2, order: 3}});
                    graficos.floatBar('#example4', finalT, undefined, "%x h - %y min");
                });
            });
        });
    }, 'json');
}

function pause(CampaignID, start, end, agents) {
    $.post('../php/reporting.php', {action: 'pausas', id: CampaignID}, function(data) {
        var pausa = {};
        $.each(data.pausas, function() {
            pausa[this.pause_code] = this.pause_code_name;
        });
        api.get({datatype: 'agent_log', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=sub_status&campaign=' + CampaignID]}}, function(datas) {
            var arr = [], a = 0, ticket = [], value = [];
            $.each(datas, function() {
                arr.push([a, Math.round(this.sum_pause / 60)]);
                value.push(this.sub_status);
                if (pausa[this.sub_status]) {
                    ticket.push([a, pausa[this.sub_status]]);
                } else {
                    ticket.push([a, this.sub_status]);
                }
                a++;
            });
            var dataset = [{label: "", data: arr, color: "#57889C"}];
            graficos.floatBar('#example5', dataset, ticket, "<span style='display:none;'>%x -</span> %y min");
            $('#example5').bind('plotclick', function(e, pos, item) {
                var pausa = value[item.dataIndex];
                $('#pausa-details .jarviswidgets').show();
                $('#pausa-details').fadeIn(400, function() {
                    $('#outbound-pause-agents').dataTable().fnClearTable();
                    $('#outbound-pause-agents').dataTable({"sPaginationType": "bootstrap", "bLengthChange": false, "bDestroy": true,
                        "sDom": "<'dt-top-row'Tlf>r<'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-6'i><'col-sm-6 text-right'p>>",
                        "oTableTools": {
                            "aButtons": [{
                                    "sExtends": "collection",
                                    "sButtonText": 'Save <span class="caret" />',
                                    "aButtons": ["csv", "xls", "pdf"]
                                }],
                            "sSwfPath": "../js/plugin/datatables/media/swf/copy_csv_xls_pdf.swf"
                        },
                        "fnInitComplete": function(oSettings, json) {
                            $(this).closest('#dt_table_tools_wrapper').find('.DTTT.btn-group').addClass('table_tools_group').children('a.btn').each(function() {
                                $(this).addClass('btn-sm btn-default');
                            });
                        }});
                    api.get({datatype: 'agent_log', type: 'total', timeline: {start: start, end: end}, by: {calls: ['by=agent&sub_status=' + pausa + '&campaign=' + CampaignID]}}, function(data) {
                        var ar = [], pie = [], win = data.length;
                        $.each(data, function() {
                            var agent = this.agent;
                            if (agents[this.agent]) {
                                agent = agents[this.agent];
                            }
                            ar.push([agent, moment().hours(0).minutes(0).seconds(this.sum_pause).format('HH:mm:ss')]);
                            pie.push({label: agent, data: this.sum_pause});
                            win--;
                            if (!win) {
                                loops(ar, pie);
                            }
                        });
                        function loops(back) {
                            graficos.pie('#out-pause-pie', []);
                            $('#outbound-pause-agents').dataTable().fnClearTable();
                            $('#outbound-pause-agents').dataTable().fnAddData(back);
                            graficos.pie('#out-pause-pie', pie);
                        }
                    });
                });
            });
        });
    }, 'json');
}

function feedbacksAgents(ar, data, CampaignID, start, end, callback) {
    var win = data.length;
    $.each(data, function() {
        var horas = 0, id = this.agent, name = this.agent, calls = this.calls, time = this.length, avg = 0, calls_hour = 0;
        api.get({datatype: 'agent_log', type: 'total', timeline: {start: start, end: end}, by: {calls: ['campaign=' + CampaignID + '&agent=' + this.agent]}}, function(data) {
            horas = (data[0].sum_dead + data[0].sum_pause + data[0].sum_billable_pause + data[0].sum_dispo + data[0].sum_talk + data[0].sum_wait);
            if (agents[this.agent]) {
                name = agents[this.agent];
            }
            if (time / calls > 0) {
                avg = Math.round(time / calls);
            }
            if (calls / (horas / 3600) > 0) {
                calls_hour = calls / (horas / 3600);
                calls_hour = calls_hour.toFixed(2);
            }
            ar.push(id, name, calls, moment().hours(0).minutes(0).seconds(time).format('HH:mm:ss'), moment().hours(0).minutes(0).seconds(avg).format('HH:mm:ss'), calls_hour);
            win--;
            if (!win) {
                callback(ar);
            }
        });
    });
}

function feedbacksDB(ar, data, callback) {
    var win = data.length;
    $.each(data, function() {
        var data = this.database, avg = Math.round(this.length / this.calls);
        if (databases[this.database]) {
            data = databases[this.database];
        }
        ar.push(this.database, data, this.calls, moment().hours(0).minutes(0).seconds(this.length).format('HH:mm:ss'), moment().hours(0).minutes(0).seconds(avg).format('HH:mm:ss'));
        win--;
        if (!win) {
            callback(ar);
        }
    });
}

function agentsFeedbacks(data, ar, statuses, hour, callback) {
    var win = data.length;
    $.each(data, function() {
        var calls_hour = this.calls / (hour / 3600), avg = Math.round(this.length / this.calls);
        ar.push([this.status, statuses[this.status], this.calls, moment().hours(0).minutes(0).seconds(this.length).format('HH:mm:ss'), moment().hours(0).minutes(0).seconds(avg).format('HH:mm:ss'), calls_hour.toFixed(2)]);
        win--;
        if (!win) {
            callback(ar);
        }
    });
}

function dbFeedbacks(data, ar, databases, hour, callback) {
    var win = data.length;
    $.each(data, function() {
        var calls_hour = this.calls / (hour / 3600), da = this.database, avg = Math.round(this.length / this.calls);
        if (databases[this.database]) {
            da = databases[this.database];
        }
        ar.push([this.database, da, this.calls, moment().hours(0).minutes(0).seconds(this.length).format('HH:mm:ss'), moment().hours(0).minutes(0).seconds(avg).format('HH:mm:ss'), calls_hour.toFixed(2)]);
        win--;
        if (!win) {
            callback(ar);
        }
    });
}

function  exportsOut(CampaignID, start, end, agents) {
    $("#outbound").on('click', '#out-excel-totals', function() {
        var url = "../php/Reporting/exportExcel.php?action=outTotais&campaign=" + CampaignID + "&start=" + start + "&end=" + end;
        document.location.href = url;
    });
    $("#outbound").on('click', '#out-excel-pause', function() {
        var url = "../php/Reporting/exportExcel.php?action=outPause&campaign=" + CampaignID + "&start=" + start + "&end=" + end;
        document.location.href = url;
    });
    $("#outbound").on('click', '#out-excel-hours', function() {
        var ar = [], all = $('#out-hour-active input[type="checkbox"]:checked');
        $.each(all, function(index, value) {
            ar.push($(this).data().txt);
        });
        var url = "../php/Reporting/exportExcel.php?action=outHour&campaign=" + CampaignID + "&start=" + start + "&end=" + end + '&pause=' + ar.join(',');
        document.location.href = url;
    });
    $("#outbound").on('click', '#out-excel-time', function() {
        var ar = [], all = $('#out-time-active input[type="checkbox"]:checked');
        $.each(all, function(index, value) {
            ar.push($(this).data().txt);
        });
        var url = "../php/Reporting/exportExcel.php?action=outTime&campaign=" + CampaignID + "&start=" + start + "&end=" + end + '&pause=' + ar.join(',');
        document.location.href = url;
    });
}