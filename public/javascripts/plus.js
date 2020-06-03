// JavaScript Document
const queryString = window.location.search;
var pngFile;
var objects_cal_array = [];

function init(gatedata, eventdata) {
  /*
  * initializes a diagram and its funcionality
  * gatedata - data of gates, which are saved in database
  * eventdata - data of events, which are saved in database
  */
  var generated_diagram_array = JSON.parse(sessionStorage.getItem("generated_diagram_array"));
  if (window.goSamples) goSamples();  
  var $ = go.GraphObject.make;  
  myDiagram =
    $(go.Diagram, "main-content",
      {
        allowCopy: false,
        allowDelete: false,
        "draggingTool.dragsTree": true,
        layout:
          $(go.TreeLayout,
            { angle: 90, layerSpacing: 30 }),
        "undoManager.isEnabled": true
      });

  function nodeFillConverter(figure) {
    switch (figure) {
      case "AND":
        return $(go.Brush, "Linear", { 0: "lightblue", 1: "lightblue", start: go.Spot.Right, end: go.Spot.Left });
      case "OR":
        return $(go.Brush, "Linear", { 0: "orange", 1: "orange", start: go.Spot.Right, end: go.Spot.Left });
      case "K/N":
        return $(go.Brush, "Linear", { 0: "lightgreen", 1: "lightgreen", start: go.Spot.Right, end: go.Spot.Left });
      case "Event":
        return $(go.Brush, "Linear", { 0: "#009620", 1: "#007717" });
      default:
        return "whitesmoke";
    }
  }
  myDiagram.nodeTemplate =
    $(go.Node, "Spot",
      { selectionObjectName: "BODY", locationSpot: go.Spot.Center, locationObjectName: "BODY" },
      $(go.Panel, "Auto",
        { name: "BODY", portId: "" },
        $(go.Shape,
          { fill: $(go.Brush, "Linear", { 0: "#770000", 1: "#600000" }), stroke: null }),
        $(go.TextBlock,
          {
            margin: new go.Margin(2, 10, 1, 10), maxSize: new go.Size(100, NaN),
            stroke: "whitesmoke", font: "10pt Segoe UI, sans-serif"
          },
          new go.Binding("text"))
      ),
      $("TreeExpanderButton", { alignment: go.Spot.Right, alignmentFocus: go.Spot.Left, "ButtonBorder.figure": "Rectangle" }),
      $(go.Shape, "LineV",
        new go.Binding("visible", "figure", function(f) { return f !== "None"; }),
        { strokeWidth: 1.5, height: 20, alignment: new go.Spot(0.5, 1, 0, -1), alignmentFocus: go.Spot.Top }),
      $(go.Shape,
        new go.Binding("visible", "figure", function(f) { return f !== "None"; }),
        {
          alignment: new go.Spot(0.5, 1, 0, 5), alignmentFocus: go.Spot.Top, width: 30, height: 30,
          stroke: null
        },
        new go.Binding("figure"),
        new go.Binding("fill", "figure", nodeFillConverter),
        new go.Binding("angle", "figure", function(f) { return (f === "OR" || f === "AND" || f === "K/N") ? -90 : 0; })), 
      $(go.TextBlock,
        new go.Binding("visible", "figure", function(f) { return f !== "None"; }), 
        {
          alignment: new go.Spot(0.5, 1, 20, 20), alignmentFocus: go.Spot.Left,
          stroke: "black", font: "10pt Segoe UI, sans-serif"
        },
        new go.Binding("text", "choice")),
        {
          contextMenu: 
          $("ContextMenu", 
          $("ContextMenuButton",
            $(go.TextBlock, "Add Gate"),
            { click: redirectNodeForAddGate },
            new go.Binding("visible", "", function(o) {
              var selectedNode = o.part;
              var nodeData = selectedNode.data; 
              var isGate = true;
              if(generated_diagram_array != null){
                isGate = false;
              } else {
                if(((nodeData.figure).localeCompare("Event")) == 0) {
                  isGate = false;
                } 
              }
              return isGate;
            }).ofObject()),
          $("ContextMenuButton",
            $(go.TextBlock, "Add Event"),
            { click: redirectNodeForAddEvent },
            new go.Binding("visible", "", function(o) {
              var selectedNode = o.part;
              var nodeData = selectedNode.data; 
              var isGate = true;
              if(generated_diagram_array != null){
                isGate = false;
              } else {
                if(((nodeData.figure).localeCompare("Event")) == 0) {
                  isGate = false;
                }
              } 
              return isGate;
            }).ofObject()),
          $("ContextMenuButton",
            $(go.TextBlock, "Edit"),
            { click: redirectNodeForEdit },
            new go.Binding("visible", "", function(o){
              var isFromData = true;
              if(generated_diagram_array.length != 0){
                isFromData = false;
              }
              return isFromData;
            }).ofObject()),
          $("ContextMenuButton",
            $(go.TextBlock, "Delete"),
            { click: deleteNode },
            new go.Binding("visible", "", function(o){
              var isFromData = true;
              if(generated_diagram_array.length != 0){
                isFromData = false;
              }
              return isFromData;
            }).ofObject())
          )  
        }
    );
  myDiagram.linkTemplate =
    $(go.Link, go.Link.Orthogonal,
      { layerName: "Background", curviness: 20, corner: 5 },
      $(go.Shape,
        { strokeWidth: 1.5 })
    );
  load(gatedata, eventdata); 
  document.getElementById("svgButton").addEventListener("click", makeSvg);
  document.getElementById("pngButton").addEventListener("click", makePng);     
}

function deleteNode(e, obj){
  // deletes node and removes results variables from sessionStorage, if they exists
  var selectedNode = obj.part;
  var nodeData = selectedNode.data;
  if(((nodeData.figure).localeCompare("Event")) == 0) {
    edit_id = objects_cal_array.find(item => item.key == nodeData.key);
    window.location.href = '/events/delete/'+edit_id.key;
    alert("Object ".concat(edit_id.name, " was successfully deleted."));
  } else {
    edit_id = objects_cal_array.find(item => item.key == nodeData.key);
    var nodeArrayToDelete = makeArrayToDelete(edit_id.key);
    var nodeToDelete;
    for(var i = 0; i < nodeArrayToDelete.length; i++){
      nodeToDelete = objects_cal_array.find(item => item.key == nodeArrayToDelete[i]);
      if((nodeToDelete.type).localeCompare("gate") == 0) {
        window.location.href = '/gates/delete/' + nodeToDelete.key;
        alert("Object ".concat(nodeToDelete.name, " was successfully deleted."));
      } else if((nodeToDelete.type).localeCompare("event") == 0) {
        window.location.href = '/events/delete/' + nodeToDelete.key;
        alert("Object ".concat(nodeToDelete.name, " was successfully deleted."));
      }
    }
  }
  sessionStorage.removeItem("results_array");
  sessionStorage.removeItem("results_options");
  sessionStorage.removeItem("original_time");
}

function makeArrayToDelete(key){
  /*
  * makes an array of objects, that have to be deleted
  * key - id of a chosen gate
  */
  var arrayToDelete = [];
  var children_new = [];
  var child_item;
  arrayToDelete.push(key);
  var children = objects_cal_array.filter(item => item.parent == key);
  do{
    for(var i = 0; i < children.length; i++){
      arrayToDelete.push(children[i].key);
      child_item = objects_cal_array.filter(item => item.parent == children[i].key);
      for(var j = 0; j < child_item.length; j++){
        children_new.push(child_item[j]);
      }
    }
    children = children_new;
    children_new = [];
  } while (children.length > 0);
  return arrayToDelete;
}


function showGateType(gateId, gateType, gateNumber){
  /*
  * shows specific gate type
  * gateId - id of a chosen gate
  * gateType - type of a chosen gate
  * gateNumber - K parameter, if exists
  */
  const product = new URLSearchParams(queryString);
  let element = document.getElementById("gate_type");
  var arrayObject = JSON.parse(sessionStorage.getItem('pole'));
  var n_number = (arrayObject.filter(item => item.parent == gateId)).length;
  element.value = gateType;
  if(gateType.localeCompare("K/N") == 0){
      document.getElementById('kn_values').style.display = "inline";
      document.getElementById("k_number").value = gateNumber;
      document.getElementById("n_number").value = n_number;
  }
  else{
      document.getElementById('kn_values').style.display = "none";
  }
}

function showValuesKN(){
  //shows values for K/N gate
  var selectBox = document.getElementById("gate_type");
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;
  if(selectedValue.localeCompare("K/N") == 0){
      document.getElementById('kn_values').style.display = "inline";
  }
  else{
      document.getElementById('kn_values').style.display = "none";
  }
}

function showCalcType(eventType, eventValues){
  /*
  * shows specific event values
  * eventType - type of a chosen event
  * eventValues - input values of a chosen event
  */
  var values_split;
  let element = document.getElementById("calculation_type");
  element.value = eventType;
  if(((eventType).localeCompare("constant")) == 0){
    document.getElementById('constant_number_form').style.display = "inline";
    document.getElementById('p_number').value = parseFloat(eventValues);
  } else if(((eventType).localeCompare("lambda")) == 0){
    document.getElementById('lambda_number_form').style.display = "inline";
    document.getElementById('lambda_number').value = parseFloat(eventValues);
  } else if(((eventType).localeCompare("lambda_mi")) == 0){
    values_split = eventValues.split(",");
    document.getElementById('lambda_number_form').style.display = "inline";
    document.getElementById('mi_number_form').style.display = "inline";
    document.getElementById('lambda_number').value = parseFloat(values_split[0]);
    document.getElementById('mi_number').value = parseFloat(values_split[1]);
  } else if(((eventType).localeCompare("mtbf")) == 0){
    document.getElementById('mtbf_number_form').style.display = "inline";
    document.getElementById('mtbf_number').value = parseFloat(eventValues);
  } else if(((eventType).localeCompare("mtbf_mttr")) == 0){
    values_split = eventValues.split(",");
    document.getElementById('mtbf_number_form').style.display = "inline";
    document.getElementById('mttr_number_form').style.display = "inline";
    document.getElementById('mtbf_number').value = parseFloat(values_split[0]);
    document.getElementById('mttr_number').value = parseFloat(values_split[1]);
  }
}

function load(gatedata, eventdata) {
  /*
  * loads data to diagram and saves data with all input values to sessionStorage
  * gatedata - data of gates, which are saved in database
  * eventdata - data of events, which are saved in database
  */
  var jsonArrDiagram = [];
  var generated_diagram_array = JSON.parse(sessionStorage.getItem("generated_diagram_array"));
  var generated_cal_array = JSON.parse(sessionStorage.getItem("generated_object_array"));
  var result_array = JSON.parse(sessionStorage.getItem("results_array"));
  if(generated_diagram_array == null){
    var res = gatedata.replace(/&quot;/g,'"');
    var gateJS = JSON.parse(res);
    res = eventdata.replace(/&quot;/g,'"');
    var eventJS = JSON.parse(res);
    var lastIndex;
    var check_results = JSON.parse(sessionStorage.getItem("results_array"));
    if(check_results != null){
      if(check_results.length != (gateJS.length + eventJS.length)){
        sessionStorage.removeItem("results_array");
      }
    }
    if(gateJS.length != 0){
      var topTextArea = (gateJS[0].name).concat("\n", gateJS[0].description);
      jsonArrDiagram.push({"key": gateJS[0]._id, "text": topTextArea, "figure": gateJS[0].gateType, "choice": makeGateChoiceText(gateJS[0])});
      objects_cal_array.push({"key": gateJS[0]._id, "name": gateJS[0].name, "type": "gate", "gateType": gateJS[0].gateType, "number": gateJS[0].number, "parent": ""});
      lastIndex = 1;
      var nodeTextArea = "";
      for(var i = 1; i < gateJS.length; i++){
        lastIndex = lastIndex + 1;
        nodeTextArea = (gateJS[i].name).concat("\n", gateJS[i].description);
        jsonArrDiagram.push({"key": gateJS[i]._id, "text": nodeTextArea, "figure": gateJS[i].gateType, "choice":makeGateChoiceText(gateJS[i]), "parent": gateJS[i].parentID});
        objects_cal_array.push({"key": gateJS[i]._id, "name": gateJS[i].name, "type": "gate",  "gateType": gateJS[i].gateType, "number": gateJS[i].number, "parent": gateJS[i].parentID});
      }
    }
    var eventText;
    var eventChoice;
    for(var i = 0; i < eventJS.length; i++){
      eventText = (eventJS[i].name).concat("\n", eventJS[i].description);
      eventChoice = makeEventChoiceText(eventJS[i]);
      jsonArrDiagram.push({"key": eventJS[i]._id, "text": eventText, "figure": "Event", "choice": eventChoice, "parent": eventJS[i].parentID});
      objects_cal_array.push({"key": eventJS[i]._id, "name": eventJS[i].name, "type": "event", "eventType": eventJS[i].eventType, "values": eventJS[i].values, "parent": eventJS[i].parentID});
    }
    sessionStorage.setItem("pole", JSON.stringify(objects_cal_array));
  } else {
    var object;
    jsonArrDiagram = generated_diagram_array;
    objects_cal_array = generated_cal_array;
    if(result_array != null){
      for(var i = 0; i < jsonArrDiagram.length; i++){
        object = result_array.find(item => item._id == jsonArrDiagram[i].key);
        jsonArrDiagram[i].choice = (jsonArrDiagram[i].choice).concat("\n", "Result: ", ((object.values[(object.values).length - 1]).toPrecision(4)).toString());
      }
    }
    sessionStorage.setItem("pole", JSON.stringify(objects_cal_array));
  }
  myDiagram.model = go.Model.fromJson({ "class": "go.TreeModel",
"nodeDataArray": jsonArrDiagram});
}

function checkTreeBeforeAnalysis(){
  // checks every gate in a created tree, if it has right number of its childs 
  var objects_cal_array = JSON.parse(sessionStorage.getItem("pole"));
  var i = 0;
  var error = false;
  var nodeChildren = [];
  var failedNodeName = "";
  if(objects_cal_array.length != 0) {
    while(error == false && i < objects_cal_array.length){
      if(objects_cal_array[i].type == "gate"){
        nodeChildren = objects_cal_array.filter(item => item.parent == objects_cal_array[i].key);
        if(((objects_cal_array[i].gateType).localeCompare("K/N")) == 0){
          if(nodeChildren.length < objects_cal_array[i].number){
            error = true;
            failedNodeName = objects_cal_array[i].name;
          }
        } else {
          if(nodeChildren.length < 2){
            error = true;
            failedNodeName = objects_cal_array[i].name;
          }
        }
      }
      i = i + 1;
    }
    if(error == false){
      window.location.href = '/startAnalysis';
    } else {
      alert("Error: Check children nodes of node with name: ".concat(failedNodeName));
    }
  } else {
    alert("Fault tree is not defined!");
  }
}

function valid(f) {
  /*
  * function, that doesnt special characters in text areas
  */
  !(/^[A-z&#209;&#241;0-9]*$/i).test(f.value)?f.value = f.value.replace(/[^A-z&#209;&#241;0-9]/ig,''):null;
} 


function getFileMTBF(event) {
  //gets file for MTBF
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  calculateValue(
      document.getElementById('mtbf_number'),
      input.files[0])
  }
}

function getFileMTTR(event) {
  //gets file for MTTR
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  calculateValue(
      document.getElementById('mttr_number'),
      input.files[0])
  }
}

function calculateValue(target, file) {
  //calculates value from a file
	readFileContent(file).then(content => {
    let res = content.split(";");
    let number = 0;
    for(var i = 0; i < res.length; i++){
      number = number + parseFloat(res[i]);
    }  
    number = number / res.length;
  	target.value = number;
  }).catch(error => console.log(error))
}

function readFileContent(file) {
  //reads file
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}



function makeGateChoiceText(gateJS){
  /*
  * creates a description for gate in diagram
  * gateJS - chosen gate
  */
  var text = "";
  var result_array = JSON.parse(sessionStorage.getItem("results_array"));
  var result;
  if(((gateJS.gateType).localeCompare("K/N")) == 0) {
    text = text.concat("K/N", "\n", "K: ", gateJS.number);
  } else {
    text = text.concat(gateJS.gateType);
  }
  if(result_array != null){
    result = result_array.find(item => item._id == gateJS._id);
    console.log(result.values[(result.values).length - 1]);
    text = text.concat("\n", "Result: ", ((result.values[(result.values).length - 1]).toPrecision(4)).toString());
  }
  return text;
}

function makeEventChoiceText(eventJS){
  /*
  * creates a description for event in diagram
  * eventJS - chosen event
  */
  var text = "\n".concat("\n");
  var result_array = JSON.parse(sessionStorage.getItem("results_array"));
  if(((eventJS.eventType).localeCompare("constant")) == 0){
    text = text.concat("Constant", "\n", "P: ", eventJS.values[0]);
  } else if(((eventJS.eventType).localeCompare("lambda")) == 0){
    text = text.concat("λ", "\n", "λ: ", eventJS.values[0]);
  } else if(((eventJS.eventType).localeCompare("lambda_mi")) == 0) {
    text = text.concat("λ and µ", "\n", "λ: ", eventJS.values[0], "\n", "µ: ", eventJS.values[1]);
  } else if(((eventJS.eventType).localeCompare("mtbf")) == 0){
    text = text.concat("MTBF", "\n", "MTBF: ", eventJS.values[0]);
  } else if(((eventJS.eventType).localeCompare("mtbf_mttr")) == 0) {
    text = text.concat("MTBF and MTTR", "\n", "MTBF: ", eventJS.values[0], "\n", "MTTR: ", eventJS.values[1]);
  }
  if(result_array != null){
    result = result_array.find(item => item._id == eventJS._id);
    console.log(result.values[(result.values).length - 1]);
    text = text.concat("\n", "Result: ", ((result.values[(result.values).length - 1]).toPrecision(4)).toString());
  }
  return text;
}

function redirectNodeForAddGate(e, obj) {
  //redirects a chosen gate to add a new child gate
    var selectedNode = obj.part;
    var nodeData = selectedNode.data;
    window.location.href = '/gates/addGate?parent_gateid='+nodeData.key;
}

function redirectNodeForAddEvent(e, obj){
  //redirects a chosen gate to add a new child event
    var selectedNode = obj.part;
    var nodeData = selectedNode.data;
    window.location.href = '/events/addEvent?parent_gateid='+nodeData.key;
}

function parseAddURL(){
  //parse url to add parent id of gate to form
  var objects_cal_array = JSON.parse(sessionStorage.getItem("pole"));
  const product = new URLSearchParams(queryString);
  var number = product.get('parent_gateid');
  var parent_gateid = new String(number);
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  var checkGate;
  if(format.test(parent_gateid)){
    window.location.href = '/error';
  } else {
    if(number == 0){
      document.getElementById("parent_id_gate_input").value= parent_gateid;
    } else{ 
      checkGate = objects_cal_array.find(item => item.key == parent_gateid);
      if(checkGate == undefined){
        window.location.href = '/error';
      } else {
        document.getElementById("parent_id_gate_input").value= parent_gateid;
      }
   }
  }
}

function parseEditURL(){
  //parse id from url, if it containst only characters for id
  var objects_cal_array = JSON.parse(sessionStorage.getItem("pole"));
  var edit_id = window.location.pathname.split("/").pop();
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  var checkObject;
  if(format.test(edit_id)){
    window.location.href = '/error';
  } else {
    checkObject = objects_cal_array.find(item => item.key == edit_id);
    if(checkObject == undefined){
      window.location.href = '/error';
    }
  }
}

function redirectNodeForEdit(e, obj) {
  // redirects chosen gate or event to edit 
  var edit_id;
  var selectedNode = obj.part;
  var nodeData = selectedNode.data;
  if(((nodeData.figure).localeCompare("Event")) == 0) {
    edit_id = objects_cal_array.find(item => item.key == nodeData.key);
    window.location.href = '/events/editEvent/'+edit_id.key;
  } else {
    edit_id = objects_cal_array.find(item => item.key == nodeData.key);
    window.location.href = '/gates/editGate/'+edit_id.key;
  }
  sessionStorage.removeItem("results_array");
}

function createTopEvent(){
  //checks if some diagram already exists before redirecting to create a new one
  if(objects_cal_array.length != 0){
    if (confirm('You can lose your unsaved data, if you continue.')) {
      sessionStorage.removeItem("generated_object_array");
      sessionStorage.removeItem("generated_diagram_array");
      sessionStorage.removeItem("results_options");
      sessionStorage.removeItem("original_time");
      window.location.href = '/deleteAllObjects';
    }
  } else {
    window.location.href = '/gates/addGate?parent_gateid='+0;
  }
}


function makeSvg() {
  //creates svg variable from diagram and downloads it 
  var arrayDiagram = JSON.parse(sessionStorage.getItem("pole"));
  if(arrayDiagram.length == 0){
    alert("Fault tree is not defined!");
  } else {
    var svg = myDiagram.makeSvg({ scale: 1, background: "white" });
    var svgToStr = new XMLSerializer().serializeToString(svg);
    var blob = new Blob([svgToStr], { type: "image/svg+xml" });
    var url = window.URL.createObjectURL(blob);
    var filename = "myDiagramInSVG.svg";
    var a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = filename;
    if (window.navigator.msSaveBlob !== undefined) {
      window.navigator.msSaveBlob(blob, filename);
      return;
    }
    document.body.appendChild(a);
    requestAnimationFrame(function() {
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
}

function makePng(){
  //creates a blob with png variable
  var arrayDiagram = JSON.parse(sessionStorage.getItem("pole"));
  if(arrayDiagram.length == 0) {
    alert("Fault tree is not defined!");
  } else {
    var blob = myDiagram.makeImageData({ background: "white", returnType: "blob", callback: downloadBlobPNG });
  }
}

function downloadBlobPNG(blob) {
  /*
  * downloads a blob 
  * blob - contains png variable
  */  
  var url = window.URL.createObjectURL(blob);
  var filename = "myDiagramInPNG.png";
  var a = document.createElement("a");
  a.style = "display: none";
  a.href = url;
  a.download = filename;
  if (window.navigator.msSaveBlob !== undefined) {
    window.navigator.msSaveBlob(blob, filename);
    return;
  }
  document.body.appendChild(a);
  requestAnimationFrame(function() {
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });
}

function showDefaultEventValues(){
  //shows default event values in a form 
  document.getElementById('constant_number_form').style.display = "inline";
  document.getElementById('lambda_number_form').style.display = "none";
  document.getElementById('mi_number_form').style.display = "none";
  document.getElementById('mtbf_number_form').style.display = "none";
  document.getElementById('mttr_number_form').style.display = "none";
}

function showEventValues(){
  //shows specific event values in a form
  var selectBox = document.getElementById("calculation_type");
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;
  if(selectedValue.localeCompare("constant") == 0){
    document.getElementById('constant_number_form').style.display = "inline";
    document.getElementById('lambda_number_form').style.display = "none";
    document.getElementById('mi_number_form').style.display = "none";
    document.getElementById('mtbf_number_form').style.display = "none";
    document.getElementById('mttr_number_form').style.display = "none";
  }
  else if(selectedValue.localeCompare("lambda") == 0){
    document.getElementById('constant_number_form').style.display = "none";
    document.getElementById('lambda_number_form').style.display = "inline";
    document.getElementById('mi_number_form').style.display = "none";
    document.getElementById('mtbf_number_form').style.display = "none";
    document.getElementById('mttr_number_form').style.display = "none";
  }
  else if(selectedValue.localeCompare("lambda_mi") == 0){
    document.getElementById('constant_number_form').style.display = "none";
    document.getElementById('lambda_number_form').style.display = "inline";
    document.getElementById('mi_number_form').style.display = "inline";
    document.getElementById('mtbf_number_form').style.display = "none";
    document.getElementById('mttr_number_form').style.display = "none";
  }
  else if(selectedValue.localeCompare("mtbf") == 0){
    document.getElementById('constant_number_form').style.display = "none";
    document.getElementById('lambda_number_form').style.display = "none";
    document.getElementById('mi_number_form').style.display = "none";
    document.getElementById('mtbf_number_form').style.display = "inline";
    document.getElementById('mttr_number_form').style.display = "none";
  }
  else if(selectedValue.localeCompare("mtbf_mttr") == 0){
    document.getElementById('constant_number_form').style.display = "none";
    document.getElementById('lambda_number_form').style.display = "none";
    document.getElementById('mi_number_form').style.display = "none";
    document.getElementById('mtbf_number_form').style.display = "inline";
    document.getElementById('mttr_number_form').style.display = "inline";
  }
}

function result_select_change(){
  //shows a graph for specific object
  var pole = JSON.parse(sessionStorage.getItem("results_array"));
  var selectBox = document.getElementById("result_select");
  var select_type = document.getElementById('values_type_select');
  var results_options = JSON.parse(sessionStorage.getItem('results_options'));
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;
  var object_result = pole[selectedValue];
  select_type.value = results_options[0].type;
  showGraph(object_result.values);
}

function showGraph(object_result){
  /*
  * generates a graph with results
  * object_result - chosen object with results
  */
  var results_options = JSON.parse(sessionStorage.getItem("results_options"));
  var original_time = JSON.parse(sessionStorage.getItem("original_time"));
  var select = document.getElementById('values_type_select');
  var selectedValue = select.options[select.selectedIndex].value;
  console.log(original_time[0].time_type);
  new Chart(document.getElementById("results-graph"), {
    type: 'line',
    data: {
      labels: original_time[0].original_time_vector,
      datasets: [{ 
          data: object_result,
          borderColor: "#3e95cd",
          label: selectedValue.concat("(t)"),
          fill: false
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Results'
      },
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            suggestedMin: 0,
            beginAtZero: true,
            suggestedMax: 1
          },
          scaleLabel: {
            display: true,
            labelString: 'Probability'
          }
        }],
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Time'.concat(" (", original_time[0].time_type, ")")
          }
        }]
      }
    }
  });

  document.getElementById("download-graph").addEventListener('click', function(){
    var url_base64jp = document.getElementById("results-graph").toDataURL("image/jpg");
    var a =  document.getElementById("download-graph");
    a.href = url_base64jp;
  });
}

function fillResultSelect(){
  //fills select with objects of diagram and shows results in a tree for top event
  var objects_array = JSON.parse(sessionStorage.getItem("pole"));
  var result_array = JSON.parse(sessionStorage.getItem("results_array"));
  var select = document.getElementById('result_select');
  for (var i = result_array.length - 1; i >= 0; i--){
    var opt = document.createElement('option');
    selected_object = objects_array.find(item => item.key == result_array[i]._id);
    if((selected_object.type).localeCompare("event") == 0){
      opt.appendChild(document.createTextNode("Name: ".concat(selected_object.name, ", Type: Event (",selected_object.eventType, ")")));
    } else if((selected_object.type).localeCompare("gate") == 0){
      if((selected_object.gateType).localeCompare("K/N") == 0){
        opt.appendChild(document.createTextNode("Name: ".concat(selected_object.name, ", Type: Gate (", selected_object.gateType, "), K: ", selected_object.number)));
      } else {
        opt.appendChild(document.createTextNode("Name: ".concat(selected_object.name, ", Type: Gate (", selected_object.gateType, ")")));
      }
    }
    opt.value = i; 
    select.appendChild(opt); 
  }
  var select_type = document.getElementById('values_type_select');
  var results_options = JSON.parse(sessionStorage.getItem('results_options'));
  if((results_options[0].type).localeCompare("R") == 0 || (results_options[0].type).localeCompare("F") == 0){
      var opt = document.createElement('option');
      opt.appendChild(document.createTextNode("R(t)"));
      opt.value = "R";
      select_type.appendChild(opt);
      opt = document.createElement('option');
      opt.appendChild(document.createTextNode("F(t)"));
      opt.value = "F";
      select_type.appendChild(opt);
  } else if((results_options[0].type).localeCompare("A") == 0 || (results_options[0].type).localeCompare("U") == 0){
      var opt = document.createElement('option');
      opt.appendChild(document.createTextNode("A(t)"));
      opt.value = "A";
      select_type.appendChild(opt);
      opt = document.createElement('option');
      opt.appendChild(document.createTextNode("U(t)"));
      opt.value = "U";
      select_type.appendChild(opt);
  }
  var obj_values = result_array[result_array.length-1];
  select_type.value = results_options[0].type;
  showGraph(obj_values.values);
}

function values_type_change(){
  // changes values of results in graph
  var select = document.getElementById('values_type_select');
  var selectedValue = select.options[select.selectedIndex].value;
  var results_options = JSON.parse(sessionStorage.getItem('results_options'));
  var pole = JSON.parse(sessionStorage.getItem("results_array"));
  var selectedObject = document.getElementById("result_select");
  var selectedObjectValue = selectedObject.options[selectedObject.selectedIndex].value;
  var object_result = pole[selectedObjectValue];
  if((results_options[0].type).localeCompare(selectedValue) != 0){
    for(var i = 0; i < (object_result.values).length; i++){
      object_result.values[i] = 1 - object_result.values[i];
    }
  }
  showGraph(object_result.values);
}

function makeTimeVector(input_time, time_type, time_step){
  /*
  * returns time vector for calculation and saves original time to sessionStorage
  * input_time - time vector
  * time_type - time unit
  * time_step - time step, which was set 
  */
  var time_vector = makeSteppedVector(input_time, time_step);
  var original_time = [];
  var num;
  if(time_type.localeCompare("hours") == 0){
    num = 1;
  } else if(time_type.localeCompare("minutes") == 0){
    num = 1 / 60;
  } else if(time_type.localeCompare("seconds") == 0){
    num = 1 / 3600;
  } else if(time_type.localeCompare("days") == 0){
    num = 24;
  } else if(time_type.localeCompare("years") == 0){
    num = 24 * 365;
  }
  original_time.push({"time_type": time_type, "original_time_vector": time_vector});
  sessionStorage.setItem("original_time", JSON.stringify(original_time));
  for(var i = 0; i < time_vector.length; i++){
    time_vector[i] = time_vector[i] * num;
  }
  return time_vector;
}

function makeSteppedVector(input_time, time_step){
  /*
  * returns time vector with time steps
  * input_time - time vector
  * time_step - time step, which was set
  */
  var time_vector = [];
  var timeStep = parseInt(time_step);
  var time = parseInt(input_time);
  var number = 0;
  if(time_step > time){
    timeStep = 1;
  } 
  time_vector.push(number);
  while(time != 0){
    number = number + timeStep;
    time_vector.push(number);
    if((number + timeStep) >= time){
      if(time_vector.includes(time) == false){
        time_vector.push(time);
      }
      time = 0;
    }
  }
  return time_vector;
}

function calculateAnalysis(){
  // calculates an analysis with parameters, which were set in settings
  var resArray = JSON.parse(sessionStorage.getItem("pole"));
  var calculation_type = document.getElementById('analysis_calculation_type').value;
  var input_time = document.getElementById('time').value;
  var time_type = document.getElementById('time_type').value;
  var time_step = document.getElementById('time_step').value;
  timel = parseInt(input_time) + 1;
  var time = makeTimeVector(input_time, time_type, time_step);
  var results_options = [];
  results_options.push({"type": calculation_type, "time_vector": time});
  sessionStorage.setItem("results_options", JSON.stringify(results_options));
  var events = resArray.filter(item => item.type == "event");
  var gate_layer = get_layers_gates(resArray);
  var results = get_event_results(events, time, calculation_type);
  var selected_gate;
  var gates_eventsValues;
  for(var i = gate_layer.length - 1; i >= 0; i--){
    for(var j = 0; j < gate_layer[i]._ids.length; j++){
      selected_gate = resArray.find(item => item.key == gate_layer[i]._ids[j]);
      gates_eventsValues = results.filter(item => item.parentID == selected_gate.key);
      if((selected_gate.gateType).localeCompare("AND") == 0){
        results.push({"_id": selected_gate.key, "parentID": selected_gate.parent, "values": and_gate(get_value_array(gates_eventsValues), calculation_type)});
      } else if((selected_gate.gateType).localeCompare("OR") == 0){
        results.push({"_id": selected_gate.key, "parentID": selected_gate.parent, "values": or_gate(get_value_array(gates_eventsValues), calculation_type)});
      } else if((selected_gate.gateType).localeCompare("K/N") == 0){
        results.push({"_id": selected_gate.key, "parentID": selected_gate.parent, "values": kn_gate(get_value_array(gates_eventsValues), calculation_type, selected_gate.number)});
      }
    } 
  }
  sessionStorage.setItem("results_array", JSON.stringify(results));
}

function checkRepairableEventsForAnalysis(){
  // checks, that all events were set 
  let element = document.getElementById("analysis_calculation_type");
  var error;
  if((element.value).localeCompare("A") == 0 || (element.value).localeCompare("U") == 0){
      error = checkEventsForMi();
      if(error == true){
        alert("Event doesnt have right input values for this type of analysis!");
        element.value = "R";
      }
  }
}

function checkEventsForMi(){
  // checks events, if they all have set input values for A or U
  var gates_events = JSON.parse(sessionStorage.getItem("pole"))
  var events = gates_events.filter(item => item.type == "event");
  var error = false;
  var index = 0;
  console.log(events);
  while(error == false && index < events.length){
    console.log(index);
    console.log(events[index].eventType)
    if((events[index].eventType).localeCompare("lambda_mi") != 0 && (events[index].eventType).localeCompare("mtbf_mttr") != 0){
      error = true;
      console.log(error);
    } else {
      index = index + 1;
    }
  }
  return error;
}

function get_value_array(gates_events){
  //returns array with gate results
  var result = [];
  for(var i = 0; i < gates_events.length; i++){
    result.push(gates_events[i].values);
  }
  return result;
}

function setDefaultType(){
  //sets default time in setting an analyze
  document.getElementById('time_type').value = "hours";
}

function get_event_results(events, time, calculation_type){
  /*
  * returns array of event results, which are calculated
  * events - array of events
  * time - time vector
  * calculation_type - calculation type, which was set
  */
  var results = [];
  var mid_result = [];
  for(var i = 0; i < events.length; i++){
    if((events[i].eventType).localeCompare("constant") == 0){
      if(calculation_type.localeCompare("R") == 0) {
        for(var j = 0; j < time.length; j++){
          mid_result.push(1 - parseFloat(events[i].values[0]));
        }
      } else if(calculation_type.localeCompare("F") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(parseFloat(events[i].values[0]));
        }
      }
    } else if((events[i].eventType).localeCompare("lambda") == 0){
      if(calculation_type.localeCompare("R") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(get_value_failure_rate(parseFloat(events[i].values[0]), time[j]));
        }
      } else if(calculation_type.localeCompare("F") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(1 - get_value_failure_rate(parseFloat(events[i].values[0]), time[j]));
        }
      }
    } else if((events[i].eventType).localeCompare("lambda_mi") == 0){
      if(calculation_type.localeCompare("R") == 0) {
        for(var j = 0; j < time.length; j++){
          mid_result.push(get_value_failure_rate(parseFloat(events[i].values[0]), time[j]));
        }
      } else if(calculation_type.localeCompare("F") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(1 - get_value_failure_rate(parseFloat(events[i].values[0]), time[j]));
        }
      }else if(calculation_type.localeCompare("A") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(get_values_forA(parseFloat(events[i].values[0]), parseFloat(events[i].values[1]), time[j]));
        }
      } else if(calculation_type.localeCompare("U") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(1 - get_values_forA(parseFloat(events[i].values[0]), parseFloat(events[i].values[1]), time[j]));
        }
      }
    } else if((events[i].eventType).localeCompare("mtbf") == 0){
      if(calculation_type.localeCompare("R") == 0) {
        for(var j = 0; j < time.length; j++){
          mid_result.push(get_value_failure_rate(failure_rate_mtbf(parseFloat(events[i].values[0])), time[j]));
        }
      } else if(calculation_type.localeCompare("F") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(1 - get_value_failure_rate(failure_rate_mtbf(parseFloat(events[i].values[0])), time[j]));
        }
      }
    } else if((events[i].eventType).localeCompare("mtbf_mttr") == 0){
      if(calculation_type.localeCompare("R") == 0) {
        for(var j = 0; j < time.length; j++){
          mid_result.push(get_value_failure_rate(failure_rate_mtbf(parseFloat(events[i].values[0])), time[j]));
        }
      } else if(calculation_type.localeCompare("F") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(1 - get_value_failure_rate(parseFloat(events[i].values[0]), time[j]));
        }
      }else if(calculation_type.localeCompare("A") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(get_values_forA(failure_rate_mtbf(parseFloat(events[i].values[0])), repairable_mttr(parseFloat(events[i].values[1])), time[j]));
        }
      } else if(calculation_type.localeCompare("U") == 0){
        for(var j = 0; j < time.length; j++){
          mid_result.push(1 - get_values_forA(failure_rate_mtbf(parseFloat(events[i].values[0])), repairable_mttr(parseFloat(events[i].values[1])), time[j]));
        }
      }
    }
    results.push({"_id": events[i].key, "parentID": events[i].parent, "values": mid_result});
    mid_result = [];
  }
  return results;
}

function get_value_failure_rate(failure_rate, time){
  /*
  * calculates R for failure rate
  * failure_rate - input value of event, which was set to failure rate
  * time - specific time of time vector
  */
  return Math.exp( -1 * failure_rate * time);
}

function get_layers_gates(resArrayJS){  
  /*
  * separates gates to layers with gates
  * resArrayJS - array with data of tree (gates, events)
  * returns JSON object, which contains layers and gates in specific layer
  */
  var groups_gates = [];
  var children_gates = [];
  var mid_result = [];
  var child_gate;
  children_gates.push(resArrayJS[0].key);
  groups_gates.push({"layer": 1, "_ids": children_gates});
  var layer = 1;
  do{
    for(var i = 0; i < children_gates.length; i++){
      child_gate = resArrayJS.filter(item => item.parent == children_gates[i]);
      for(var j = 0; j < child_gate.length; j++){
        if(child_gate[j].type == "gate"){
        mid_result.push(child_gate[j].key);
        }
      }
    }
    if(mid_result.length != 0){
      layer = layer + 1;
      groups_gates.push({"layer": layer, "_ids": mid_result});
    }
    children_gates = mid_result;
    mid_result = [];
  } while(children_gates.length != 0);
  return groups_gates;
}

function and_gate(arraysToCalculate, cal_type){
  /*
  * calculates AND gate logic
  * arraysToCalculate - arrays with values, that have to be calculated
  * cal_type - type of analysis (R, F, A, U)
  * returns array with results of AND gate
  */
  var result = [];
  var number;
  var cal_number;
  if(cal_type.localeCompare("R") == 0 || cal_type.localeCompare("A") == 0){
    for(var i = 0; i < arraysToCalculate[0].length; i++){
      number = 1;
      for(var j = 0; j < arraysToCalculate.length; j++){
        cal_number = 1 - arraysToCalculate[j][i];
        number = number * cal_number;
      }
      result.push(1 - number);
    }
  } else if(cal_type.localeCompare("F") == 0 || cal_type.localeCompare("U") == 0){
    for(var i = 0; i < arraysToCalculate[0].length; i++){
      number = 1;
      for(var j = 0; j < arraysToCalculate.length; j++){
        number = number * arraysToCalculate[j][i];
      }
      result.push(number);
    }
  }
  return result;
}

function or_gate(arraysToCalculate, cal_type){
  /*
  * calculates OR gate logic
  * arraysToCalculate - arrays with values, that have to be calculated
  * cal_type - type of analysis (R, F, A, U)
  * returns array with results of OR gate
  */
  var result = [];
  var number;
  var cal_number;
  if(cal_type.localeCompare("R") == 0 || cal_type.localeCompare("A") == 0){
    for(var i = 0; i < arraysToCalculate[0].length; i++){
      number = 1;
      for(var j = 0; j < arraysToCalculate.length; j++){
        number = number * arraysToCalculate[j][i];
      }
      result.push(number);
    }
  } else if(cal_type.localeCompare("F") == 0 || cal_type.localeCompare("U") == 0){
    for(var i = 0; i < arraysToCalculate[0].length; i++){
      number = 1;
      for(var j = 0; j < arraysToCalculate.length; j++){
        cal_number = 1 - arraysToCalculate[j][i];
        number = number * cal_number;
      }
      result.push(1 - number);
    }
  }
  return result;
}

function kn_gate(arraysToCalculate, cal_type, k_number){
  /*
  * calculates K/N gate logic
  * arraysToCalculate - arrays with values, that have to be calculated 
  * cal_type - type of analysis (R, F, A, U)
  * k_number - value of K parameter
  * returns array with results of K/N gate
  */
  var result = [];
  var number;
  var arrayLength = arraysToCalculate.length;
  if(cal_type.localeCompare("R") == 0 || cal_type.localeCompare("A") == 0){
    for(var i = 0; i < arraysToCalculate[0].length; i++){
      number = 0;
      for(var j = 0; j <= k_number - 1; j++){
        number = number + (calculate_factorial(arrayLength) / (calculate_factorial(j) * calculate_factorial(arrayLength - j))) * Math.pow(arraysToCalculate[0][i], j) * Math.pow(1 - arraysToCalculate[0][i], arrayLength - j); 
      }
      result.push(1 - number);
    }
  } else if(cal_type.localeCompare("F") == 0 || cal_type.localeCompare("U") == 0){
    for(var i = 0; i < arraysToCalculate[0].length; i++){
      number = 0;
      for(var j = 0; j <= k_number - 1; j++){
        number = number + (calculate_factorial(arrayLength) / (calculate_factorial(j) * calculate_factorial(arrayLength - j))) * Math.pow(1 - arraysToCalculate[0][i], j) * Math.pow(arraysToCalculate[0][i], arrayLength - j);
      }
      result.push(number);
    }
  }
  return result;
}

function calculate_factorial(number){
  //calculates factorial for next calculations from input number
  var num_fact = 1;
  for(var i = 2; i <= number; i++){
    num_fact = num_fact * i;
  }
  return num_fact;
}

function failure_rate_mtbf(MTBF){
  // returns failure rate, which was set as MTBF - Mean Time Between Failures
  return 1 / MTBF;
}

function repairable_mttr(MTTR){
  // returns repair rate, which was set as MTTR - Mean Time To Repair
  return 1 / MTTR;
}

function get_values_forA(lambda, mi, time){
  /*
  * returns calculated value for A
  * lambda - lambda value, which was set in input values of event
  * mi - mi value, which was set in input values of event
  * time - specific time of time vector
  */
  var result;
  result = (mi / (lambda + mi)) + ((lambda / (lambda + mi)) * Math.exp(-1 * (lambda + mi) * time));
  return result;
}

function redirectToResults(){
  // checks, that results exist and redirection to a page can be done
  var result_array = sessionStorage.getItem("results_array");
  if(result_array == null){
    alert("You have to perform an analyse to see results!");
  } else {
    window.location.href = '/results';
  }
}

function saveResultsToTxt(){
  // downloads a text file, which contains results from analysis
  var result_array = JSON.parse(sessionStorage.getItem("results_array"));
  var results_options = JSON.parse(sessionStorage.getItem('results_options'));
  if(result_array == null){
    alert("No results found.");
  } else {
    var filename = "results_in_".concat(results_options[0].type, ".txt");
    var text = getResultsText(result_array, results_options);
    var blob = new Blob([text], {type:'text/plain'});
    var link = document.createElement("a");
    var url = window.URL.createObjectURL(blob);
    link.style = "display: none";
    link.download = filename;
    link.innerHTML = "Download File";
    link.href = url;
    document.body.appendChild(link);
    requestAnimationFrame(function() {
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    });
  }
}

function getResultsText(results_array){
  /*
  * builds a text from results
  * results_array - JSON array of results
  */
  var object_array = JSON.parse(sessionStorage.getItem('pole'));
  var original_time = JSON.parse(sessionStorage.getItem("original_time"));
  var text = "";
  var sub_text = "";
  var name;
  var parent_name;
  var time = original_time[0].original_time_vector;
  var objectOfArray;
  var parentObjectOfArray;
  for(var i = 0; i < results_array.length; i++){
    objectOfArray = object_array.find(item => item.key == results_array[i]._id);
    console.log(objectOfArray);
    if((objectOfArray.parent).localeCompare("") == 0){
      parent_name = ""
    } else {
      parentObjectOfArray = object_array.find(item => item.key == objectOfArray.parent);
      parent_name = parentObjectOfArray.name;
    }
    name = objectOfArray.name;
    for(var j = 0; j < (results_array[i].values).length; j++){
      sub_text = "";
      sub_text = sub_text.concat("Name: ", name, "; Parent name: ", parent_name, "; Time: ", time[j], "(", original_time[0].time_type, ")", "; Result: ", results_array[i].values[j]);
      text = text.concat(sub_text, "\n");
    }
    
  }
  return text;
}

function generateRandomTree(){
  // validates input from prompt window and sends it to function startGenaratingTree with user input as parameter
  var object_array = JSON.parse(sessionStorage.getItem('pole'));
  if(object_array.length != 0){
    if (window.confirm("You can lose your unsaved data, if you continue.")) { 
      sessionStorage.removeItem("generated_object_array");
      sessionStorage.removeItem("generated_diagram_array");
      sessionStorage.removeItem("results_options");
      sessionStorage.removeItem("original_time");
      window.location.href = '/deleteAllObjects';
    }
  } else {
    var selection = parseInt(window.prompt("How many gates? (1-30):", "Type a number!"), 10);
    if ( /^[0-9]*$/.test(selection)) {
      if(selection >= 1 && selection <= 30){
        startGeneratingTree(selection);
      } else {
        alert('Wrong input! Type a positive integer from 1-30!');
      }
    } else {
      alert('Wrong input! Type a positive integer from 1-30!');
    }
  }
}

function startGeneratingTree(number){
  /*
  * function, that generates random fault tree
  * parameter number - quantity of included gates in a tree
  */
  var objects_cal_array = [];
  var jsonArrDiagram = [];
  var number_of_gates = number;
  var random_number_gates;
  var object_id = 1;
  var parent_id = object_id;
  var number_of_events;
  var eventType;
  var eventValue;
  var gates_array;
  var children_object;
  var gateType = generateGateType();
  objects_cal_array.push({"key": object_id, "name": "Vrcholova udalost", "type": "gate", "gateType": gateType, "parent": ""});
  jsonArrDiagram.push({"key": object_id, "text": "Vrcholova udalost","figure": gateType, "choice": gateType});
  number_of_gates = number_of_gates - 1;
  while(number_of_gates != 0){
    random_number_gates = Math.floor(Math.random() * (number_of_gates - 1 + 1) ) + 1;
    for(var i = 0; i < random_number_gates; i++){
      object_id = object_id + 1;
      gateType = generateGateType();
      objects_cal_array.push({"key": object_id, "name": "Gate", "type": "gate", "gateType": gateType, "parent": parent_id});
      jsonArrDiagram.push({"key": object_id, "text": "Gate", "figure": gateType, "choice": gateType, "parent": parent_id});
    }
    number_of_gates = number_of_gates - random_number_gates;
    parent_id = object_id;
  }
  gates_array = objects_cal_array.filter(item => item.type == "gate");
  for(var i = 0; i < gates_array.length; i++){
    children_object = gates_array.filter(item => item.parent == gates_array[i].key);
    if(children_object.length < 2){
      number_of_events = 2 - children_object.length;
      console.log(number_of_events);
      for(var j = 0; j < number_of_events; j++){
        object_id = object_id + 1;
        eventType = generateEventType();
        eventValue = generateEventValue();
        objects_cal_array.push({"key": object_id, "name": "Event", "type": "event", "eventType": eventType, "values": eventValue, "parent": gates_array[i].key});
        jsonArrDiagram.push({"key": object_id, "text": "Event", "figure": "Event", "choice": makeGeneratedEventChoice(eventType, eventValue), "parent": gates_array[i].key});
      }
    }
  }
  sessionStorage.setItem("generated_object_array", JSON.stringify(objects_cal_array));
  sessionStorage.setItem("generated_diagram_array", JSON.stringify(jsonArrDiagram));
  window.location.href = '/';
}

function generateGateType(){
  // gate type generator - generates gate AND or gate OR
  var gateType = "";
  var choice = Math.floor(Math.random() * (1 - 0 + 1) ) + 0;
  if(choice == 0){
    gateType = "AND";
  } else if(choice == 1){
    gateType = "OR";
  }
  return gateType;
}

function generateEventType(){
  // event type generator - generates gate constant or lambda
  var eventType = "";
  var choice = Math.floor(Math.random() * (1 - 0 + 1) ) + 0;
  if(choice == 0){
    eventType = "constant";
  } else if(choice == 1){
    eventType = "lambda";
  }
  return eventType;
}

function generateEventValue(){
  // generates array with event value
  var value_array = [];
  var number = (Math.random() * (5 - 0)) + 0;
  var choice = Math.floor(Math.random() * (2 - 0 + 1) ) + 0;;
  if(choice == 0){
    number = number / 10;
  } else if(choice == 1){
    number = number / 100;
  } else if(choice == 2){
    number = number / 1000;
  }
  number = number.toFixed(5);
  value_array.push(number);
  return value_array;
}

function makeGeneratedEventChoice(eventType, eventValue){
  // creates a basic description for event in a generated diagram
  var text = "\n".concat("\n");
  if((eventType.localeCompare("constant")) == 0){
    text = text.concat("Constant", "\n", "P: ", eventValue[0]);
  } else if((eventType.localeCompare("lambda")) == 0){
    text = text.concat("λ", "\n", "λ: ", eventValue[0]);
  }
  return text;
}

