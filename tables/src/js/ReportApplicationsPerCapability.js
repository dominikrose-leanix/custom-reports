var ReportApplicationsPerCapability = (function() {
    function ReportApplicationsPerCapability(reportSetup, tagFilter, title) {
        this.reportSetup = reportSetup;
        this.tagFilter = tagFilter;
        this.title = title;
    }

    ReportApplicationsPerCapability.prototype.render = function() {
        var that = this;

        var factSheetPromise = $.get(this.reportSetup.apiBaseUrl + '/factsheets?relations=true&types[]=10&types[]=18&pageSize=-1')
            .then(function (response) {
                return response.data;
            });

        $.when(factSheetPromise)
            .then(function (data) {

                var fsIndex = new FactSheetIndex(data);

                for (var id in fsIndex.index.businessCapabilities) {
                    var item = fsIndex.index.businessCapabilities[id];
                    item['stats'] = {
                        'services' : [],
                        'serviceCost' : 0
                    };
                    item['serviceCost'] = 0;
                }

                for (var id in fsIndex.index.services) {
                    var ids = [];
                    var service = fsIndex.index.services[id];
                    if (service.serviceHasBusinessCapabilities && service.serviceHasBusinessCapabilities.length) {
                        ids = service.serviceHasBusinessCapabilities.map(function(item) {
                            return item.businessCapabilityID;
                        });
                    }

                    var serviceCost = 0;
                    if (service.serviceHasResources) {
                        service.serviceHasResources.forEach(function(item) {
                            if (item.costTotalAnnual)
                                serviceCost += item.costTotalAnnual;
                        });
                    }

                    var serviceHasCriticality = false;
                    var weightedCriticality = 0; 
                    if (service.businessCriticalityID) {
                        serviceHasCriticality = true;
                        if (service.businessCriticalityID == "4") {
                            weightedCriticality += 100;
                        }
                        if (service.businessCriticalityID == "3") {
                            weightedCriticality += 66;
                        }
                        if (service.businessCriticalityID == "2") {
                            weightedCriticality += 33;
                        }
                    }

                    ids.forEach(function(id) {
                        if (fsIndex.index.businessCapabilities[id]) {
                            fsIndex.index.businessCapabilities[id].stats.services.push(service.ID);
                        
                            if (serviceHasCriticality) {
                                if (!fsIndex.index.businessCapabilities[id].stats.servicesWithCriticality) {
                                    fsIndex.index.businessCapabilities[id].stats.servicesWithCriticality = [];
                                    fsIndex.index.businessCapabilities[id].stats.weightedCriticality = 0;
                                }

                                fsIndex.index.businessCapabilities[id].stats.servicesWithCriticality.push(service.ID);
                                fsIndex.index.businessCapabilities[id].stats.weightedCriticality += weightedCriticality;
                            }

                        } else {
                            console.warn('Unable to find item with id = ' + id);
                        }
                    });

                }

                // products will be presented by react-bootstrap-table

                var list = fsIndex.getSortedList('businessCapabilities');

                var output = [];
                for (var i = 0; i < list.length; i++) {
                    if (!that.tagFilter || list[i].tags.indexOf(that.tagFilter) != -1)  {
                        var criticality = list[i].stats.servicesWithCriticality ? list[i].stats.weightedCriticality / list[i].stats.servicesWithCriticality.length : 0;
                        var color = list[i].stats.servicesWithCriticality;

                        var text = "";
                        if (criticality) {
                            if (criticality>75) text = "Administrative Service";
                            else if (criticality>50) text = "Business Operational";
                            else if (criticality>25) text = "Business Critical";
                            else text = "Mission Critical";
                        } else {
                            if (color) text = "Mission Critical";
                        }
                       
                        output.push({
                            name : list[i].displayName,
                            id : list[i].ID,
                            count : list[i].stats.services.length,
                            criticality : criticality,
                            color : color,
                            text : text
                        });
                    }
                }

                function link(cell, row) {
                    return '<a href="' + that.reportSetup.baseUrl + '/businessCapabilities/' + row.id + '" target="_blank">' + cell + '</a>';
                }

                function criticalityFormat(cell, row) {
                    if (row.color)
                        return  '<div class="criticality" style="background-color: ' + getGreenToRed(row.criticality) + ';">' + cell + ' </div>';
                    else
                        return '<div>' + cell + '</div>';
                }

                function getGreenToRed(percent){
                    var r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
                    var g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
                    return 'rgb('+r+','+g+',0)';
                }

                var options = {
                    sortName : 'name',
                    sortOrder : 'asc'
                };

                var options = $.extend({}, BootstrapTable.defaultProps.options, options);

                ReactDOM.render(
                    <div>
                        <BootstrapTable data={output} striped={true} hover={true} search={true} exportCSV={true} options={options}>
                            <TableHeaderColumn dataField="name" isKey={true} dataAlign="left" dataSort={true} dataFormat={link} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Business Capability</TableHeaderColumn>
                            <TableHeaderColumn dataField="count" width="200" dataSort={true} dataFormat={criticalityFormat}># of apps</TableHeaderColumn>
                            <TableHeaderColumn dataField="text" width="200" dataSort={true} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Average criticality</TableHeaderColumn>
                        </BootstrapTable>
                    </div>,
                    document.getElementById("app")
                );
            });
    };

    return ReportApplicationsPerCapability;
})();