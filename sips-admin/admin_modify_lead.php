<!DOCTYPE html>

<html>

    <head>
        <meta charset="utf-8">
        <title>Crm Main</title>
        <link type="text/css" rel="stylesheet" href="/bootstrap/css/jquery.jgrowl.css">
        <link type="text/css" rel="stylesheet" href="/bootstrap/css/style.css" />
        <link type="text/css" rel="stylesheet" href="/bootstrap/css/bootstrap.css" />
        <link type="text/css" rel="stylesheet" href="/bootstrap/css/chosen-1.min.css" />
        <link type="text/css" rel="stylesheet" href="/bootstrap/icon/font-awesome.css" />
        <link type="text/css" rel="stylesheet" href="/bootstrap/css/datetimepicker.css" />
        <link type="text/css" rel="stylesheet" href="/bootstrap/css/validationEngine.jquery.css" />
        <link type="text/css" rel="stylesheet" href="/bootstrap/css/demo_table.css" />


        <script type="text/javascript" src="/jquery/jquery-1.9.1.js"></script>
        <script type="text/javascript" src="/jquery/jqueryUI/jquery-ui-1.10.2.custom.min.js"></script>
        <script type="text/javascript" src="/bootstrap/js/bootstrap.min.js"></script>
        <script type="text/javascript" src="/bootstrap/js/chosen-1.jquery.min.js"></script>
        <script type="text/javascript" src="/bootstrap/js/moment.min.js"></script>
        <script type="text/javascript" src="/bootstrap/js/moment.langs.min.js"></script>
        <script type="text/javascript" src="/bootstrap/js/jquery.jgrowl.js"></script>
        <script type="text/javascript" src="/bootstrap/js/datetimepicker/bootstrap-datetimepicker.min.js"></script>
        <script type="text/javascript" src="/bootstrap/js/datetimepicker/locales/bootstrap-datetimepicker.pt.js"></script>
        <script type="text/javascript" src="/bootstrap/js/validation/jquery.validationEngine.js"></script>
        <script type="text/javascript" src="/bootstrap/js/validation/languages/jquery.validationEngine-pt.js"></script>
        <script type="text/javascript" src="/bootstrap/js/validation/contrib/other-validations.js"></script>
        <script type="text/javascript" src="/bootstrap/js/jquery.dataTables.min.js"></script>

        <script type="text/javascript" src="/sips-admin/crm/crm_edit/crm_edit.js?v=5"></script>
        <meta name="viewport" content="width=device-width">
    </head>
    <body>
        <div class="content">
            <div class="grid">
                <div class="grid-title">
                    <div class="pull-left">Edição de Dados de Cliente</div>
                </div>
                <div class="grid-content">
                    <div id="crm_main_zone">
                    </div>
                </div>
            </div>
        </div>


        <script>
            $(function()
            {
                moment.lang("pt");

                var crm_edit1 = new crm_edit($("#crm_main_zone"), "/sips-admin/crm/",<?= $_GET['lead_id'] ?>);
                crm_edit1.init();
            });
        </script>
    </body>


</html>
