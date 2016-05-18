var ReportProjectDependencies = (function() {
    function ReportProjectDependencies(reportSetup, tagFilter, title) {
        this.reportSetup = reportSetup;
        this.tagFilter = tagFilter;
        this.title = title;
    }

    ReportProjectDependencies.prototype.render = function() {
        var that = this;

        var factSheetPromise = $.get(this.reportSetup.apiBaseUrl + '/factsheets?relations=true&types[]=10&types[]=16&types[]=19&pageSize=-1')
            .then(function (response) {
                return response.data;
            });

        $.when(factSheetPromise)
            .then(function (data) {

                var fsIndex = new FactSheetIndex(data);

                var list = fsIndex.getSortedList('projects');

                var output = [];
                for (var i = 0; i < list.length; i++) {
                    if (!that.tagFilter || list[i].tags.indexOf(that.tagFilter) != -1)  {

                        var dependentProjects = list[i].factSheetHasSuccessors;

                        for (var j = 0; j < dependentProjects.length; j++) {
                            var tmp = dependentProjects[j];
                            if (tmp) {
                                if (tmp.factSheetRefID && fsIndex.index.projects[tmp.factSheetRefID]) {
                                   dependentProject = fsIndex.index.projects[tmp.factSheetRefID];
                                   resources = dependentProject.projectHasResources;
                                   for (var k = 0; k < resources.length; k++) {
                                        if (resources[k].resourceID && fsIndex.index.resources[resources[k].resourceID]) {
                                            resource = fsIndex.index.resources[resources[k].resourceID];
                                            output.push({
                                                project : list[i].displayName,
                                                projectID : list[i].ID,
                                                dependentProject : dependentProject.displayName,
                                                dependentProjectID : dependentProject.ID,
                                                resource : resource.fullName,
                                                resourceID : resource.ID,
                                            });
                                        }
                                    }
                                    services = dependentProject.serviceHasProjects;
                                    for (var k = 0; k < services.length; k++) {
                                        if (services[k].serviceID && fsIndex.index.services[services[k].serviceID]) {
                                            service = fsIndex.index.services[services[k].serviceID];
                                            output.push({
                                                project : list[i].displayName,
                                                projectID : list[i].ID,
                                                dependentProject : dependentProject.displayName,
                                                dependentProjectID : dependentProject.ID,
                                                service : service.fullName,
                                                serviceID : service.ID,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }


                function linkProject(cell, row) {
                    if (row.projectID)
                        return '<a href="' + that.reportSetup.baseUrl + '/projects/' + row.projectID + '" target="_blank">' + cell + '</a>';
                }

                function linkResource(cell, row) {
                    if (row.resourceID)
                        return '<a href="' + that.reportSetup.baseUrl + '/resources/' + row.resourceID + '" target="_blank">' + cell + '</a>';
                }
                
                function linkService(cell, row) {
                    if (row.serviceID)
                        return '<a href="' + that.reportSetup.baseUrl + '/services/' + row.serviceID + '" target="_blank">' + cell + '</a>';
                }

                function linkDependentProject(cell, row) {
                    if (row.dependentProjectID)
                        return '<a href="' + that.reportSetup.baseUrl + '/projects/' + row.dependentProjectID + '" target="_blank">' + cell + '</a>';
                    return cell;
                }

                ReactDOM.render(
                    <div>
                        <BootstrapTable data={output} striped={true} hover={true} search={true} exportCSV={true}>
                            <TableHeaderColumn dataField="id" isKey={true} hidden={true}>ID</TableHeaderColumn>
                            <TableHeaderColumn dataField="project" dataAlign="left" dataSort={true} dataFormat={linkProject} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Project</TableHeaderColumn>
                            <TableHeaderColumn dataField="dependentProject" dataAlign="left" dataSort={true} dataFormat={linkDependentProject} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Dependent Project</TableHeaderColumn>
                            <TableHeaderColumn dataField="resource" dataAlign="left" dataSort={true} dataFormat={linkResource} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>IT Component</TableHeaderColumn>
                            <TableHeaderColumn dataField="service" dataAlign="left" dataSort={true} dataFormat={linkService} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Application</TableHeaderColumn>
                           </BootstrapTable>
                    </div>,
                    document.getElementById("app")
                );
            });
    };

    return ReportProjectDependencies;
})();
