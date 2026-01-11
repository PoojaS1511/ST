const { supabase } = require('../../supabase_client');

// SUB-MODULE 1: DASHBOARD OVERVIEW
exports.getKPIs = async (req, res) => {
  try {
    // Get total faculty count
    const { count: totalFaculty } = await supabase
      .from('faculty')
      .select('*', { count: 'exact', head: true });

    // Get pending audits
    const { count: pendingAudits } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']);

    // Get open grievances
    const { count: openGrievances } = await supabase
      .from('grievances')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']);

    // Get overall policy compliance rate
    const { data: policies } = await supabase
      .from('policies')
      .select('compliance_score');

    const overallComplianceRate = policies && policies.length > 0
      ? Math.round(policies.reduce((sum, policy) => sum + policy.compliance_score, 0) / policies.length)
      : 0;

    // Get accreditation readiness score
    const { data: latestReport } = await supabase
      .from('accreditation_reports')
      .select('overall_score')
      .order('created_at', { ascending: false })
      .limit(1);

    const accreditationReadinessScore = latestReport && latestReport.length > 0 
      ? latestReport[0].overall_score 
      : 0;

    // Monthly trends
    const monthlyTrends = {
      faculty_performance: [75, 78, 82, 80, 85, 88],
      audit_completion_rate: [60, 65, 70, 75, 80, 85],
      grievance_resolution_rate: [70, 72, 75, 78, 80, 82],
      policy_compliance: [80, 82, 85, 87, 90, 92]
    };

    const kpis = {
      total_faculty: totalFaculty || 0,
      pending_audits: pendingAudits || 0,
      open_grievances: openGrievances || 0,
      overall_policy_compliance_rate: overallComplianceRate,
      accreditation_readiness_score: accreditationReadinessScore,
      monthly_trends: monthlyTrends
    };

    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard KPIs'
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    // Get recent audits
    const { data: recentAudits } = await supabase
      .from('audits')
      .select('id, title, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    // Get recent grievances
    const { data: recentGrievances } = await supabase
      .from('grievances')
      .select('id, title, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    // Get recent policy updates
    const { data: recentPolicies } = await supabase
      .from('policies')
      .select('id, title, compliance_status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    const activities = [
      ...recentAudits.map(item => ({ ...item, type: 'audit' })),
      ...recentGrievances.map(item => ({ ...item, type: 'grievance' })),
      ...recentPolicies.map(item => ({ ...item, type: 'policy' }))
    ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
};
