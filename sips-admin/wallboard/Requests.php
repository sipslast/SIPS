<?php

error_reporting(E_ALL ^ E_DEPRECATED ^ E_NOTICE);
ini_set('display_errors', '1');
require("../../ini/dbconnect.php");
foreach ($_POST as $key => $value) {
          ${$key} = $value;
}
foreach ($_GET as $key => $value) {
          ${$key} = $value;
}


switch ($action) {


          case 'layout':
                    $query = "SELECT * from WallBoard_Layout";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(id => $row["id"], name => $row["Name"]);
                    }
                    echo json_encode($js);
                    break;

          case 'get_layout':
                    $query = "SELECT * from WallBoard_Layout where id=$id";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(id => $row["id"], name => $row["Name"]);
                    }
                    echo json_encode($js);
                    break;


          case 'insert_Layout':
                    $query = "INSERT INTO WallBoard_Layout (name) VALUES ('LayoutNova hehe')";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    break;

          case 'remove_Layout':
                    $query = "DELETE FROM WallBoard_Layout WHERE id=$layout_Id";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    $query = "DELETE FROM WallBoard WHERE layout_id=$layout_Id";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    break;

          case 'edit_Layout':
                    $query = "UPDATE WallBoard_Layout SET Name='$name'  WHERE id=$id";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    break;

          case 'insert_wbe':
                    $query = "INSERT INTO WallBoard (name, posX ,  posY ,  width ,  height ,  layout_id ,  query_text , opcao_query, update_time ,  graph_type) VALUES ('$name',$posx,$posy,$width,$height,$layout_id,'$query_text','$opcao_query',$update_time,$graph_type);";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    break;

          case 'edit_WBE':
                    $query = "UPDATE WallBoard SET  posX=$posX, posY=$posY, width=$width,height=$height, layout_id=$layout_Id  WHERE id=$id";

                    $query = mysql_query($query, $link) or die(mysql_error());
                    break;

          case 'delete_WBE':
                    $query = "DELETE FROM WallBoard WHERE id=$id";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    break;

          case 'wbe':
                    $query = "SELECT * FROM  WallBoard  where layout_id=$layout_Id";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_array($query, MYSQL_ASSOC)) {
                              $js[] = array(id => $row["id"], name => $row["name"], posX => $row["posX"], posY => $row["posY"], width => $row["width"], height => $row["height"], layout_Id => $row["layout_id"], query_text => $row["query_text"], opcao_query => $row["opcao_query"], update_time => $row["update_time"], graph_type => $row["graph_type"]);
                    }
                    echo json_encode($js);
                    break;




          case 'get_query':
                    $query = "SELECT * from WallBoard_Query where type_query=$graph_type ";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(id => $row["id"], query_text => $row["query_text"], opcao_query => $row["opcao_query"], type_query => $row["type_query"]);
                    }
                    echo json_encode($js);
                    break;




          //graficos-----------------------------------------
          case '1'://real time - total chamadas
                    $query = $selected_query;
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = $row["var1"];
                    }
                    echo json_encode($js);
                    break;

          case '2'://barras - total vendas por user
                    $query = $selected_query;
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(user => $row["var1"], status_count => $row["var2"]);
                    }
                    echo json_encode($js);
                    break;

          case '3':// tarte - total feedbacks por user
                    $query = $selected_query;
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(status_name => $row["var1"], count => $row["var2"]);
                    }
                    echo json_encode($js);
                    break;

          case '4'://inbound
                    $query = $selected_query;

                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_array($query)) {
                              $js[] = array(
                                  callsToday => $row[0],
                                  dropsToday => $row[1],
                                  answersToday => $row[2],
                                  VSCcat1 => $row[3],
                                  VSCcat1tally => $row[4],
                                  VSCcat2 => $row[5],
                                  VSCcat2tally => $row[6],
                                  VSCcat3 => $row[7],
                                  VSCcat3tally => $row[8],
                                  VSCcat4 => $row[9],
                                  VSCcat4tally => $row[10],
                                  hold_sec_stat_one => $row[11],
                                  hold_sec_stat_two => $row[12],
                                  hold_sec_answer_calls => $row[13],
                                  hold_sec_drop_calls => $row[14],
                                  hold_sec_queue_calls => $row[15],
                                  inGroupDetail => $row[16]);
                    }
                    echo json_encode($js);
                    break;

  

          case 'get_agents':// Inbound agentes,campaign,status
                    $query = $query_text;
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = $row["status"];
                    }
                    echo json_encode($js);
                    break;

          case 'inbound_groups_info':// Inbound agentes,campaign,status
                    $query = " SELECT answer_sec_pct_rt_stat_one,answer_sec_pct_rt_stat_two FROM vicidial_inbound_groups WHERE group_id='$group_id'";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(answer_sec_pct_rt_stat_one => $row["answer_sec_pct_rt_stat_one"], answer_sec_pct_rt_stat_two => $row["answer_sec_pct_rt_stat_two"]);
                    }
                    echo json_encode($js);
                    break;





//graficos-----------------------------------------
//flot EXTRAS --------------flot EXTRAS --------------flot EXTRAS --------------flot EXTRAS --------------flot EXTRAS --------------flot EXTRAS -------------- 
          case 'campaign_id':
                    $query = "SELECT  a.campaign_id,b.campaign_name  FROM  vicidial_campaign_statuses a inner join vicidial_campaigns b on a.campaign_id=b.campaign_id  group by  campaign_id ";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(campaign_id => $row["campaign_id"], campaign_name => $row["campaign_name"]);
                    }
                    echo json_encode($js);
                    break;

          case 'status_venda':
                    $query = "SELECT status ,status_name  FROM vicidial_campaign_statuses  group by status";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(status_v => $row["status"], status_t => $row["status_name"]);
                    }
                    echo json_encode($js);
                    break;

          case 'user_group':
                    $query = "SELECT  user_group  as ug FROM  vicidial_log  where call_date between date_sub(NOW(), INTERVAL $param1) and now() and user_group is not NUll group by  user_group ";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = $row["ug"];
                    }
                    echo json_encode($js);
                    break;
          case 'group_inbound':
                    $query = "SELECT group_id,group_name FROM vicidial_inbound_groups";
                    $query = mysql_query($query, $link) or die(mysql_error());
                    while ($row = mysql_fetch_assoc($query)) {
                              $js[] = array(id => $row["group_id"], name => $row["group_name"]);
                    }
                    echo json_encode($js);
                    break;
//flot EXTRAS --------------flot EXTRAS --------------flot EXTRAS --------------flot EXTRAS --------------flot EXTRAS --------------flot EXTRAS --------------
}
?>