var ReportResponsibilities = (function() {
  function ReportResponsibilities(reportSetup, tagFilter) {
    this.reportSetup = reportSetup;
    this.tagFilter = tagFilter;
  }

  ReportResponsibilities.prototype.render = function() {
    var that = this;

    var userPromise = $.get(this.reportSetup.apiBaseUrl + '/users')
    .then(function (response) {
      return response;
    });
    var users = {};
    $.when(userPromise)
    .then(function (data) {

      for (var i = 0; i < data.length; i++) {
        users[data[i].ID] = data[i];
      }
    });

    var factSheetPromise = $.get(this.reportSetup.apiBaseUrl + '/factsheets?relations=true&types[]=10&types[]=16&types[]=13&pageSize=-1')
    .then(function (response) {
      return response.data;
    });

    $.when(factSheetPromise)
    .then(function (data) {

      var fsIndex = new FactSheetIndex(data);

      var list = fsIndex.getSortedList('services');


      var getLookup = function(data) {
        var ret = {};
        for (var i = 0; i < data.length; i++) {
          ret[data[i]] = data[i];
        }

        return ret;
      };

      var output = [];
      var markets = {};

      var groupedByMarket = {};

      function getGreenToRed(percent){
        var r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
        var g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
        return 'rgb('+r+','+g+',0)';
      }




      for (var i = 0; i < list.length; i++) {

        var requires = list[i].factSheetHasRequires;
        var supportTeam = "";
        var supportTeamID = "";
        for (var j = 0; j < list[i].factSheetHasRequires.length; j++) {
          factSheetRefID = list[i].factSheetHasRequires[j].factSheetRefID;
          provider = fsIndex.index.providers[factSheetRefID];
          supportTeamID = provider.ID;
          supportTeam = provider.name + " " + provider.description;
       }

        

        var subscriptions = {};
        for (var j = 0; j < list[i].userSubscriptions.length; j++) {
          userID = list[i].userSubscriptions[j].userID;
          subscriptions[list[i].userSubscriptions[j].roleDetails]=users[userID].email;
        }



        var item = {
          name : list[i].fullName,
          type : 'App',
          id : list[i].ID,
          completion : Math.floor(list[i].completion * 100),
          businessResponsible : subscriptions["Business Responsible"],
          supportTeamID : supportTeamID,
          supportTeam : supportTeam, 
          count : ''
        };
        output.push(item);

      }



    function link(cell, row) {
      if (row.type != 'Market')
      return '<a href="' + that.reportSetup.baseUrl + '/services/' + row.id + '" target="_blank">' + cell + '</a>';
      else
      return '<b>' + cell + '</b>';
    }

    function linkProvider(cell, row) {
      return '<a href="' + that.reportSetup.baseUrl + '/providers/' + row.supportTeamID + '" target="_blank">' + cell + '</a>';
    }

    function percentage(cell, row) {
      return  '<div class="percentage" style="background-color: ' + getGreenToRed(cell) + ';">' + cell + ' %</div>';
    }

    function trClassFormat(rowData,rIndex){
      return 'tr-type-' + rowData.type.toLowerCase();
    }



    ReactDOM.render(
      <div className="report-data-quality">
      <BootstrapTable data={output} striped={false} hover={true} search={true} condensed={true} exportCSV={true} trClassName={trClassFormat}>
      <TableHeaderColumn dataField="id" isKey={true} hidden={true}>ID</TableHeaderColumn>
      <TableHeaderColumn dataField="name" dataAlign="left" dataSort={true} dataFormat={link} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Application Name</TableHeaderColumn>
      <TableHeaderColumn dataField="businessResponsible" dataAlign="left" dataSort={true} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Business Responsible</TableHeaderColumn>
      <TableHeaderColumn dataField="supportTeam" dataAlign="left" dataSort={true} dataFormat={linkProvider} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Support Team</TableHeaderColumn>
      
      </BootstrapTable>
      </div>,
      document.getElementById("app")
    );
  });
};

return ReportResponsibilities;
})();
