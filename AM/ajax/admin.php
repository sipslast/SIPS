<?php

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
error_reporting(E_ALL ^ E_DEPRECATED ^ E_NOTICE);
ini_set('display_errors', '1');

require "$root/ini/db.php";
require "$root/ini/dbconnect.php";
require "$root/ini/user.php";
require "$root/AM/lib_php/products.php";
require "$root/AM/lib_php/requests.php";

foreach ($_POST as $key => $value) {
    ${$key} = $value;
}
foreach ($_GET as $key => $value) {
    ${$key} = $value;
}
$user = new mysiblings($db);
$products = new products($db);


switch ($action) {
    case "download_excel_csm":
        header('Content-Encoding: UTF-8');
        header('Content-type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename=Report_Sem_marcaçao_' . date("Y-m-d_H:i:s") . '.csv');
        $output = fopen('php://output', 'w');
        $query = "SELECT lead_id,first_name,address1,entry_date FROM  vicidial_list
                    WHERE user=? AND status='NEW' AND list_id=99800002  AND lead_id NOT IN (SELECT lead_id FROM sips_sd_reservations)";
        $variables[] = $user->id;
        $stmt = $db->prepare($query);
        $stmt->execute($variables);
        fputcsv($output, array("Lead", "Nome", "Morada", "Data"), ";", '"');
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, $row, ";", '"');
        }
        fclose($output);
        break;

    case "listar_produtos_to_datatable":
        $temp = $products->get_products_to_datatable();
        foreach ($temp as &$value) {
            foreach ($value as &$value2) {
                switch ($value2[6]) {
                    case "1":
                        $value2[6] = "Branch";
                        break;
                    case "3":
                        $value2[6] = "Dispenser";
                        break;
                    case "5":
                        $value2[6] = "ASM";
                        break;
                    case "8":
                        $value2[6] = "Admin";
                        break;
                }
                $value2[7] = $value2[7] . "<div class='view-button input-append'><span   data-product_id='" . $value2["id"] . "' class='btn item_edit_button btn-primary'>Ver/Editar</span><span   data-product_id='" . $value2["id"] . "' class='btn item_delete_button btn-danger '>Remover</span></div>";
            };
        };
        echo(json_encode($temp));
        break;

    case "listar_produtos":
        echo(json_encode($products->get_products()));
        break;

    case"get_agentes":
        echo(json_encode($user->get_agentes()));
        break;

    case "transferir_marcaçao_caledario":
        $stmt = $db->prepare("UPDATE sips_sd_reservations SET id_user=? WHERE id_user=?");
        $stmt->execute(array($new_user, $old_user));
        echo(json_encode($stmt->rowCount()));
        break;
}
