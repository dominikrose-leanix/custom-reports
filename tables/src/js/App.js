(function () {
    'use strict';

    var reportSetup = new ReportSetup();

    switch (reportSetup.getArg('report')) {
        case 'test':
            break;
        case 'app-lifecycle':
            var report = new ReportApplicationLifecycle(reportSetup);
            break;
        case 'app-functional-fit':
            var report = new ReportApplicationFunctionalFit(reportSetup);
            break;
        case 'project-dependencies':
            var report = new ReportProjectDependencies(reportSetup, 'SO Measure');
            break;
        case 'process-spend':
            var report = new ReportProcessSpend(reportSetup);
            break;
        case 'capability-definitions':
            var report = new ReportHierarchy(reportSetup);
            break;
        case 'capability-definitions-cobra':
            var report = new ReportHierarchy(reportSetup, 'COBRA');
            break;
        case 'capability-definitions-bca':
            var report = new ReportHierarchy(reportSetup, 'BCA');
            break;
        case 'capability-spend-cobra':
            var report = new ReportCapabilitySpend(reportSetup, 'COBRA');
            break;
        case 'capability-spend-bca':
            var report = new ReportCapabilitySpend(reportSetup, 'BCA');
            break;
        case 'data-quality':
            var report = new ReportDataQuality(reportSetup);
            break;
        case 'data-quality-services':
            var report = new ReportDataQualityServices(reportSetup);
            break;
        case 'responsibilities':
            var report = new ReportResponsibilities(reportSetup);
            break;
        case 'capability-spend':
            var report = new ReportCapabilitySpend(reportSetup);
            break;
        case 'apps-per-capability':
            var report = new ReportApplicationsPerCapability(reportSetup);
            break;
        default:
    }

    if (report)
        report.render();

})();
