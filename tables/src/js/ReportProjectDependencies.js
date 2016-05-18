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

                        var dependentProjects = list[i].factSheetHasPredecessors;

                        for (var j = 0; j < dependentProjects.length; j++) {
                            var tmp = dependentProjects[j];
                            if (tmp) {
                                if (tmp.projectID && fsIndex.index.projects[tmp.projectID]) {
                                    resources = tmp.projectHasResources;
                                    for (var k = 0; k < resources.length; k++) {
                                        if (resources[k].resourceID && fsIndex.index.resourcess[resources[k].resourceID]) {
                                            output.push({
                                                project : list[i].fullName,
                                                projectId : list[i].ID,
                                                dependentProject : tmp.fullName,
                                                dependentProjectId : tmp.ID,
                                                resource : resources[k].fullName,
                                                resourceID : resources[k].ID,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }


                function link(cell, row) {
                    return '<a href="' + that.reportSetup.baseUrl + '/services/' + row.id + '" target="_blank">' + cell + '</a>';
                }

                function linkBusinessCapability(cell, row) {
                    if (row.businessCapabilityID)
                        return '<a href="' + that.reportSetup.baseUrl + '/businessCapabilities/' + row.businessCapabilityID + '" target="_blank">' + cell + '</a>';
                }

                ReactDOM.render(
                    <div>
                        <BootstrapTable data={output} striped={true} hover={true} search={true} exportCSV={true}>
                            <TableHeaderColumn dataField="id" isKey={true} hidden={true}>ID</TableHeaderColumn>
                            <TableHeaderColumn dataField="project" dataAlign="left" dataSort={true} dataFormat={linkBusinessCapability} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Project</TableHeaderColumn>
                            <TableHeaderColumn dataField="dependentProject" dataAlign="left" dataSort={true} dataFormat={linkBusinessCapability} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>Dependent Project</TableHeaderColumn>
                            <TableHeaderColumn dataField="resource" dataAlign="left" dataSort={true} dataFormat={linkBusinessCapability} filter={{type: "TextFilter", placeholder: "Please enter a value"}}>IT Component</TableHeaderColumn>
                           </BootstrapTable>
                    </div>,
                    document.getElementById("app")
                );
            });
    };

    return ReportProjectDependencies;
})();
