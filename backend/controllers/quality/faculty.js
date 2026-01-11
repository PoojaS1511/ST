const { supabase } = require('../../supabase_client');

// SUB-MODULE 2: FACULTY PERFORMANCE DATA
exports.getAllFaculty = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, search } = req.query;
    
    let query = supabase
      .from('faculty')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (department) {
      query = query.eq('department', department);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty data'
    });
  }
};

exports.addFaculty = async (req, res) => {
  try {
    const facultyData = {
      ...req.body,
      performance_rating: req.body.performance_rating || 0,
      research_output: req.body.research_output || 0,
      student_feedback_score: req.body.student_feedback_score || 0,
      teaching_hours: req.body.teaching_hours || 0,
      publications: req.body.publications || 0,
      projects: req.body.projects || 0
    };

    const { data, error } = await supabase
      .from('faculty')
      .insert([facultyData])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Faculty added successfully'
    });
  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add faculty'
    });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('faculty')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Faculty updated successfully'
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update faculty'
    });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete faculty'
    });
  }
};

exports.getFacultyAnalytics = async (req, res) => {
  try {
    // Performance trends
    const performanceTrends = [
      { month: 'Jan', score: 75 },
      { month: 'Feb', score: 78 },
      { month: 'Mar', score: 82 },
      { month: 'Apr', score: 80 },
      { month: 'May', score: 85 },
      { month: 'Jun', score: 88 }
    ];

    // Research output trends
    const researchOutput = [
      { month: 'Jan', count: 15 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 22 },
      { month: 'Apr', count: 20 },
      { month: 'May', count: 25 },
      { month: 'Jun', count: 28 }
    ];

    // Department comparison
    const { data: departmentData } = await supabase
      .from('faculty')
      .select('department, performance_rating')
      .not('performance_rating', 'is', null);

    const departmentComparison = departmentData ? 
      departmentData.reduce((acc, faculty) => {
        const dept = acc.find(item => item.department === faculty.department);
        if (dept) {
          dept.total += faculty.performance_rating;
          dept.count += 1;
        } else {
          acc.push({
            department: faculty.department,
            total: faculty.performance_rating,
            count: 1
          });
        }
        return acc;
      }, []).map(item => ({
        department: item.department,
        score: Math.round(item.total / item.count)
      })) : [];

    const analytics = {
      performance_trends: performanceTrends,
      research_output: researchOutput,
      department_comparison: departmentComparison
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching faculty analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty analytics'
    });
  }
};
