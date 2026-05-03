import React from 'react'
import LeadsOverviewChart from '@/components/dashboard/LeadsOverviewChart'
import MaterialRequestWidget from '@/components/dashboard/MaterialRequestWidget'
import Schedule from '@/components/dashboard/ScheduleWidget'
import Project from '@/components/dashboard/ProjectStatusWidget'
import TeamProgress from '@/components/dashboard/TeamProgressWidget'
import PaymentRecordChart from '@/components/dashboard/PaymentRecordChart'
import SiteOverviewStatistics from '@/components/dashboard/SiteOverviewStatistics'
import TasksOverviewChart from '@/components/dashboard/TasksOverviewChart'
import MonthlyProgressWidget from '@/components/dashboard/MonthlyProgressWidget'
import HomeQuotationSummaryChart from '@/components/dashboard/HomeQuotationSummaryChart'
import HomeTenderSummaryChart from '@/components/dashboard/HomeTenderSummaryChart'
import SalesMiscellaneous from '@/components/dashboard/SalesMiscellaneous'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import PageHeader from '@/components/shared/pageHeader/PageHeader'

import { projectsDataTwo } from '@/utils/fackData/projectsDataTwo'

const Home = () => {
    return (
        <>
            {/* <PageHeader >
                <PageHeaderDate />
            </PageHeader> */}
            <div className='main-content'>
                <div className='row'>

                    {/* <div className="col-12">
                        <div className="card border-0 mb-4">
                            <div className="card-body text-center py-5">

                                <h1 className="display-4 fw-bold text-dark mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold' }}>
                                    WELCOME
                                </h1>



                            </div>
                        </div>
                    </div> */}

                    {/* <SiteOverviewStatistics /> */}
                    <LeadsOverviewChart chartHeight={315} />
                    <HomeQuotationSummaryChart chartHeight={315} />
                    <HomeTenderSummaryChart chartHeight={315} />
                    <PaymentRecordChart />
                    {/* <SalesMiscellaneous isFooterShow={true} dataList={projectsDataTwo} /> */}
                    {/* <TasksOverviewChart /> */}
                    <MonthlyProgressWidget chartHeight={315} />


                    <MaterialRequestWidget />
                    {/* <Schedule title={"Upcoming Schedule"} /> */}
                    {/* <Project cardYSpaceClass="hrozintioal-card" borderShow={true} title="Project Status" />
                    <TeamProgress title={"Team Progress"} footerShow={true} /> */}


                </div>
            </div>

        </>
    )
}

export default Home