import React, { useState, useEffect } from 'react';
import { Search, Users, Award, MapPin, User, BookOpen, TrendingUp, Target, CheckCircle, AlertCircle, Calendar, Star, Filter, Trophy, Medal, GraduationCap, Eye, School, Home, Users2, UserCheck, Percent } from 'lucide-react';

const SainikRankTracker = () => {
  const [filters, setFilters] = useState({
    class_level: '6',
    home_state: '',
    category: '',
    gender: ''
  });
  const [students, setStudents] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [vacancyStats, setVacancyStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [userRollNumber, setUserRollNumber] = useState('');
  const [showAdmissionTracker, setShowAdmissionTracker] = useState(false);
  const [selectedSchoolForTracking, setSelectedSchoolForTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(null); // Track which school is loading
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dropdownOptions, setDropdownOptions] = useState({
    states: [],
    categories: ['GEN', 'OBC NCL', 'SC', 'ST', 'DEF'],
    genders: ['Boy', 'Girl'],
    school_preferences: []
  });

  // Fetch dropdown options on component mount
  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  const fetchDropdownOptions = async () => {
    try {
      const response = await fetch('http://localhost:3011/api/rank-tracker/options');
      const result = await response.json();
      if (result.success) {
        setDropdownOptions(result.data);
      }
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  // Combined search function for both students and vacancies
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSelectedStudent(null);
    setShowAdmissionTracker(false);
    setSelectedSchoolForTracking(null);
  
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('class_level', filters.class_level);
  
      if (filters.home_state) queryParams.append('home_state', filters.home_state);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.gender) queryParams.append('gender', filters.gender);
  
      // Debug: Log the query parameters being sent
      console.log('🔍 Search Parameters:', queryParams.toString());
      console.log('🔍 Filter values:', filters);

      // Fetch both students and vacancies simultaneously
      const [studentsResponse, vacanciesResponse] = await Promise.all([
        fetch(`http://localhost:3011/api/rank-tracker/students?${queryParams.toString()}`),
        fetch(`http://localhost:3011/api/rank-tracker/vacancies?${queryParams.toString()}`)
      ]);
  
      const studentsResult = await studentsResponse.json();
      const vacanciesResult = await vacanciesResponse.json();
      
      // Debug: Log API responses
      console.log('👥 Students Response:', studentsResult);
      console.log('🏫 Vacancies Response:', vacanciesResult);
  
      // Handle students data
      if (studentsResponse.ok && studentsResult.success) {
        // Sort students by air_rank and assign filtered ranks
        const sortedStudents = studentsResult.data.sort((a, b) => parseInt(a.air_rank) - parseInt(b.air_rank));
        
        // Assign filtered rank to each student based on their position in filtered results
        const studentsWithFilteredRank = sortedStudents.map((student, index) => ({
          ...student,
          filtered_rank: index + 1, // 1-based filtered rank
          original_air_rank: student.air_rank // Keep original for reference
        }));
        
        setStudents(studentsWithFilteredRank);
        console.log('✅ Students loaded:', studentsWithFilteredRank.length);
        console.log('📊 First few students with filtered ranks:', studentsWithFilteredRank.slice(0, 5));
      } else {
        console.error('❌ Error fetching students:', studentsResult.message);
        setStudents([]);
      }

      // Handle vacancies data
      if (vacanciesResponse.ok && vacanciesResult.success) {
        setVacancies(vacanciesResult.data);
        setVacancyStats(vacanciesResult.summary);
        console.log('✅ Vacancies loaded:', vacanciesResult.data.length);
        console.log('✅ Vacancy stats:', vacanciesResult.summary);
      } else {
        console.error('❌ Error fetching vacancies:', vacanciesResult.message);
        setVacancies([]);
        setVacancyStats(null);
      }

      // Set error message if both searches returned no results
      if ((studentsResult.data?.length === 0 || !studentsResult.success) && 
          (vacanciesResult.data?.length === 0 || !vacanciesResult.success)) {
        setError('No students or vacancies found with the selected filters. Try different criteria.');
      }
  
    } catch (err) {
      setError(err.message || 'Error fetching data');
      setStudents([]);
      setVacancies([]);
      setVacancyStats(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };


  const getSortedStudents = () => {
    const sorted = [...students].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'rank':
          aVal = parseInt(a.air_rank);
          bVal = parseInt(b.air_rank);
          break;
        case 'marks':
          aVal = parseInt(a.total_marks);
          bVal = parseInt(b.total_marks);
          break;
        case 'name':
          aVal = a.candidate_name.toLowerCase();
          bVal = b.candidate_name.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    
    return sorted;
  };

  // Find user's student record
  const findUserStudent = () => {
    if (!userRollNumber) return null;
    
    const foundStudent = students.find(student => 
      student.roll.toString().trim().toLowerCase() === userRollNumber.toString().trim().toLowerCase()
    );
    
    console.log('🔍 Finding user student:', {
      searchRoll: userRollNumber,
      studentsCount: students.length,
      foundStudent: foundStudent ? {
        name: foundStudent.candidate_name,
        roll: foundStudent.roll,
        filtered_rank: foundStudent.filtered_rank,
        air_rank: foundStudent.air_rank,
        gender: foundStudent.gender,
        category: foundStudent.category
      } : null
    });
    
    return foundStudent;
  };

  // Calculate admission probability for a school using filtered ranks
  const calculateAdmissionProbability = (school, userStudent) => {
    if (!userStudent || !school) return null;

    console.log('🎯 School analysis for:', school.school_name);
    console.log('👤 User student details:', {
      name: userStudent.candidate_name,
      roll: userStudent.roll,
      gender: userStudent.gender,
      category: userStudent.category,
      filtered_rank: userStudent.filtered_rank
    });
    console.log('🏫 School requirements:', {
      gender: school.gender,
      category: school.category,
      class_level: school.class_level,
      available_seats: school.vacancies
    });

    // Enhanced gender mapping for comparison
    const normalizeGender = (gender) => {
      if (!gender) return '';
      const genderStr = gender.toString().toLowerCase().trim();
      const genderMap = {
        'male': 'Boy',
        'female': 'Girl',
        'boy': 'Boy',
        'girl': 'Girl',
        'm': 'Boy',
        'f': 'Girl'
      };
      return genderMap[genderStr] || gender;
    };

    // Enhanced category mapping for comparison - Fixed to handle OBC variations
    const normalizeCategory = (category) => {
      if (!category) return '';
      const categoryStr = category.toString().toUpperCase().trim();
    
      // Normalize OBC variations
      if (categoryStr.includes('OBC')) {
        return 'OBC NCL';
      }
    
      // Normalize DEF variations
      if (
        categoryStr.includes('DEF') ||
        categoryStr.includes('DEFENCE') ||
        categoryStr.includes('EX-SERVICEMEN')
      ) {
        return 'DEF';
      }
    
      const categoryMap = {
        'GENERAL': 'GEN',
        'GEN': 'GEN',
        'SC': 'SC',
        'ST': 'ST',
        'DEF': 'DEF'
      };
    
      return categoryMap[categoryStr] || categoryStr;
    };
    

    // Filter students who match the school's specific criteria
    const eligibleStudents = students.filter(student => {
      const normalizedStudentGender = normalizeGender(student.gender);
      const normalizedSchoolGender = normalizeGender(school.gender);
      const normalizedStudentCategory = normalizeCategory(student.category);
      const normalizedSchoolCategory = normalizeCategory(school.category);
      
      const matchesGender = normalizedStudentGender === normalizedSchoolGender;
      const matchesCategory = normalizedStudentCategory === normalizedSchoolCategory;
      
      console.log(`📋 Checking student ${student.candidate_name}:`, {
        student_gender: student.gender,
        normalized_student_gender: normalizedStudentGender,
        school_gender: school.gender,
        normalized_school_gender: normalizedSchoolGender,
        gender_match: matchesGender,
        student_category: student.category,
        normalized_student_category: normalizedStudentCategory,
        school_category: school.category,
        normalized_school_category: normalizedSchoolCategory,
        category_match: matchesCategory,
        overall_match: matchesGender && matchesCategory
      });
      
      return matchesGender && matchesCategory;
    }).sort((a, b) => parseInt(a.air_rank) - parseInt(b.air_rank));

    // Assign specific school filtered ranks to eligible students
    const eligibleWithSchoolRank = eligibleStudents.map((student, index) => ({
      ...student,
      school_filtered_rank: index + 1
    }));

    console.log('✅ Eligible students for school:', eligibleWithSchoolRank.length);
    console.log('📋 First 5 eligible students:', eligibleWithSchoolRank.slice(0, 5).map(s => ({
      name: s.candidate_name,
      roll: s.roll,
      school_rank: s.school_filtered_rank,
      air_rank: s.air_rank,
      category: s.category,
      gender: s.gender
    })));

    // Find user's position in the school-specific eligible list
    const userInEligibleList = eligibleWithSchoolRank.find(student => 
      student.roll.toString().trim().toLowerCase() === userStudent.roll.toString().trim().toLowerCase()
    );
    const userSchoolRank = userInEligibleList ? userInEligibleList.school_filtered_rank : -1;
    const availableSeats = school.vacancies;
    
    console.log('📊 Final user analysis:', {
      userRoll: userStudent.roll,
      userCategory: userStudent.category,
      userGender: userStudent.gender,
      normalizedUserCategory: normalizeCategory(userStudent.category),
      normalizedUserGender: normalizeGender(userStudent.gender),
      schoolCategory: school.category,
      schoolGender: school.gender,
      normalizedSchoolCategory: normalizeCategory(school.category),
      normalizedSchoolGender: normalizeGender(school.gender),
      userFound: !!userInEligibleList,
      userSchoolRank,
      availableSeats,
      totalEligible: eligibleWithSchoolRank.length,
      userInEligibleDetails: userInEligibleList ? {
        name: userInEligibleList.candidate_name,
        school_rank: userInEligibleList.school_filtered_rank,
        air_rank: userInEligibleList.air_rank
      } : null
    });
    
    let probability = 'Unknown';
    let status = 'uncertain';
    let message = '';

    if (userSchoolRank === -1) {
      // Double check if the user matches the criteria
      const userNormalizedGender = normalizeGender(userStudent.gender);
      const schoolNormalizedGender = normalizeGender(school.gender);
      const userNormalizedCategory = normalizeCategory(userStudent.category);
      const schoolNormalizedCategory = normalizeCategory(school.category);
      
      const genderMatch = userNormalizedGender === schoolNormalizedGender;
      const categoryMatch = userNormalizedCategory === schoolNormalizedCategory;
      
      console.log('🔍 Detailed criteria check:', {
        userNormalizedGender,
        schoolNormalizedGender,
        genderMatch,
        userNormalizedCategory,
        schoolNormalizedCategory,
        categoryMatch
      });
      
      if (!genderMatch && !categoryMatch) {
        message = `You do not match the criteria for this school (Required: ${school.gender} ${school.category}, You are: ${userStudent.gender} ${userStudent.category})`;
      } else if (!genderMatch) {
        message = `Gender mismatch (Required: ${school.gender}, You are: ${userStudent.gender})`;
      } else if (!categoryMatch) {
        message = `Category mismatch (Required: ${school.category}, You are: ${userStudent.category})`;
      } else {
        message = 'You do not match the criteria for this school';
      }
      
      probability = '0%';
      status = 'no-chance';
    } else if (availableSeats === 0) {
      probability = '0%';
      status = 'no-chance';
      message = 'No seats available';
    } else if (userSchoolRank <= availableSeats) {
      probability = '95-100%';
      status = 'excellent';
      message = `Strong chance! You're rank ${userSchoolRank} for ${availableSeats} seats`;
    } else if (userSchoolRank <= availableSeats * 1.2) {
      probability = '70-90%';
      status = 'good';
      message = `Good chance! You're rank ${userSchoolRank} for ${availableSeats} seats (waitlist possible)`;
    } else if (userSchoolRank <= availableSeats * 1.5) {
      probability = '30-60%';
      status = 'moderate';
      message = `Moderate chance! You're rank ${userSchoolRank} for ${availableSeats} seats`;
    } else {
      probability = '0-25%';
      status = 'low';
      message = `Low chance! You're rank ${userSchoolRank} for ${availableSeats} seats`;
    }

    return {
      probability,
      status,
      message,
      userPosition: userSchoolRank,
      availableSeats,
      eligibleStudents: eligibleWithSchoolRank.slice(0, Math.max(availableSeats * 2, 10))
    };
  };

  // Handle school tracking
  const handleTrackAdmission = async (school) => {
    if (!userRollNumber) {
      alert('Please enter your roll number first to track admission probability');
      return;
    }
    
    const userStudent = findUserStudent();
    if (!userStudent) {
      alert('Roll number not found in the results. Please check your roll number.');
      return;
    }

    // Set loading state for this specific school
    setTrackingLoading(school.id);
    
    try {
      // Add a small delay to simulate processing and let user see the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSelectedSchoolForTracking(school);
      setShowAdmissionTracker(true);
    } finally {
      // Clear loading state
      setTrackingLoading(null);
    }
  };

  const getRankIcon = (rank) => {
    const rankNum = parseInt(rank);
    if (rankNum <= 10) return Trophy;
    if (rankNum <= 50) return Medal;
    return Award;
  };

  const getRankColor = (rank) => {
    const rankNum = parseInt(rank);
    if (rankNum <= 10) return 'text-yellow-600 bg-yellow-50';
    if (rankNum <= 50) return 'text-orange-600 bg-orange-50';
    if (rankNum <= 100) return 'text-purple-600 bg-purple-50';
    return 'text-blue-600 bg-blue-50';
  };

  
const getResultStatus = (result) => {
  if (!result) {
    return { status: 'not_qualified', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
  }
  
  const resultLower = result.toLowerCase();
  
  // Check for "not qualified" first (more specific check)
  if (resultLower.includes('not qualified')) {
    return { status: 'not_qualified', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
  }
  
  // Then check for just "qualified"
  if (resultLower.includes('qualified')) {
    return { status: 'qualified', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
  }
  
  // Default to not qualified for any other case
  return { status: 'not_qualified', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
};

  const getAdmissionStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'no-chance': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6 border border-${color}-200 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium mb-1`}>{title}</p>
          <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
          {subtitle && <p className={`text-${color}-600 text-xs mt-1`}>{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  const userStudent = findUserStudent();
  const admissionData = selectedSchoolForTracking ? calculateAdmissionProbability(selectedSchoolForTracking, userStudent) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div className="text-center">
      {/* Mobile Layout - Stacked and Compact */}
      <div className="block sm:hidden space-y-1">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          Dabad Academy's
        </h1>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          Sainik School Rank Tracker
        </h1>
        <p className="mt-3 text-gray-600 text-sm px-2 leading-relaxed">
          Predict your selection in Sainik Schools based on your Score in AISSEE 2025
        </p>
      </div>

      {/* Tablet Layout - Medium Size */}
      <div className="hidden sm:block md:hidden">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          Dabad Academy's
        </h1>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          Sainik School Rank Tracker
        </h1>
        <p className="mt-3 text-gray-600 text-base leading-relaxed">
          Predict your selection in Sainik Schools based on your Score in AISSEE 2025
        </p>
      </div>

      {/* Desktop Layout - Full Size */}
      <div className="hidden md:block">
       
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
        Dabad Academy's <br></br> Sainik School Rank Tracker
        </h1>
        <p className="mt-4 text-gray-600 text-lg xl:text-xl leading-relaxed max-w-4xl mx-auto">
          Predict your selection in Sainik Schools based on your Score in AISSEE 2025
        </p>
      </div>

      {/* Alternative Single Responsive Layout (uncomment if preferred) */}
      {/* 
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
        Dabad Academy's
      </h1>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
        Sainik School Rank Tracker
      </h1>
      <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base md:text-lg xl:text-xl leading-relaxed px-2 sm:px-0 max-w-4xl mx-auto">
        Predict your selection in Sainik Schools based on your Score in AISSEE 2025
      </p>
      */}
    </div>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
  {/* Filter Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
    {/* Class Level */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Class Level</label>
      <select
        value={filters.class_level}
        onChange={(e) => handleFilterChange('class_level', e.target.value)}
        className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-sm sm:text-base bg-white"
      >
        <option value="6">Class 6</option>
        <option value="9">Class 9</option>
      </select>
    </div>

    {/* Home State */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Home State</label>
      <select
        value={filters.home_state}
        onChange={(e) => handleFilterChange('home_state', e.target.value)}
        className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-sm sm:text-base bg-white"
      >
        <option value="">All States</option>
        {dropdownOptions.states.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
    </div>

    {/* Category */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Category</label>
      <select
        value={filters.category}
        onChange={(e) => handleFilterChange('category', e.target.value)}
        className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-sm sm:text-base bg-white"
      >
        <option value="">All Categories</option>
        {dropdownOptions.categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>

    {/* Gender */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Gender</label>
      <select
        value={filters.gender}
        onChange={(e) => handleFilterChange('gender', e.target.value)}
        className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-sm sm:text-base bg-white"
      >
        <option value="">All Genders</option>
        {dropdownOptions.genders.map((gender) => (
          <option key={gender} value={gender}>{gender}</option>
        ))}
      </select>
    </div>
  </div>

  {/* User Roll Number Input */}
  <div className="mb-6 space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      <span className="hidden sm:inline">Your Roll Number (for admission tracking)</span>
      <span className="sm:hidden">Your Roll Number</span>
    </label>
    <input
      type="text"
      value={userRollNumber}
      onChange={(e) => setUserRollNumber(e.target.value)}
      placeholder="Enter your roll number to track admission probability"
      className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400"
    />
    {userStudent && (
      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700 flex items-start sm:items-center">
          <CheckCircle className="h-4 w-4 mr-2 mt-0.5 sm:mt-0 flex-shrink-0 text-green-600" />
          <span>
            <span className="font-medium">Found:</span> {userStudent.candidate_name}
            <span className="block sm:inline sm:ml-1">(Rank #{userStudent.air_rank})</span>
          </span>
        </p>
      </div>
    )}
  </div>

  {/* Search Button */}
  <button
    onClick={handleSearch}
    disabled={loading}
    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
  >
    {loading ? (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        <span className="hidden sm:inline">Searching...</span>
        <span className="sm:hidden">Searching...</span>
      </div>
    ) : (
      <>
        <span className="hidden sm:inline">Search Students & Seat Availability</span>
        <span className="sm:hidden">Search Students & Availability</span>
      </>
    )}
  </button>
</div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Admission Tracker Modal */}
        {showAdmissionTracker && selectedSchoolForTracking && admissionData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Admission Probability Tracker</h3>
                  <button
                    onClick={() => setShowAdmissionTracker(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* School Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedSchoolForTracking.school_name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="font-medium">State:</span> {selectedSchoolForTracking.state}</div>
                    <div><span className="font-medium">Class:</span> {selectedSchoolForTracking.class_level}</div>
                    <div><span className="font-medium">Category:</span> {selectedSchoolForTracking.category}</div>
                    <div><span className="font-medium">Gender:</span> {selectedSchoolForTracking.gender}</div>
                  </div>
                </div>

                
                
                {/* Probability Summary */}
<div
  className={`grid gap-6 mb-6 ${
    admissionData.userPosition !== -1 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
  }`}
>
  {/* Admission Probability Card */}
  <div className={`rounded-xl p-6 border-2 ${getAdmissionStatusColor(admissionData.status)}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium mb-1">Admission Probability</p>
        <p className="text-2xl font-bold">{admissionData.probability}</p>
      </div>
      <Percent className="h-8 w-8" />
    </div>
  </div>

  {/* User Position Card (conditionally shown) */}
  {admissionData.userPosition !== -1 && (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 font-medium mb-1">Your Position</p>
          <p className="text-2xl font-bold text-gray-900">#{admissionData.userPosition}</p>
        </div>
        <Target className="h-8 w-8 text-gray-500" />
      </div>
    </div>
  )}

  {/* Available Seats Card */}
  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-green-600 font-medium mb-1">Available Seats</p>
        <p className="text-2xl font-bold text-green-900">{admissionData.availableSeats}</p>
      </div>
      <School className="h-8 w-8 text-green-500" />
    </div>
  </div>
</div>


                {/* Status Message */}
                <div className={`rounded-xl p-4 mb-6 border ${getAdmissionStatusColor(admissionData.status)}`}>
                  <p className="font-medium">{admissionData.message}</p>
                </div>

                {/* Eligible Students List */}
                <div>
                  <h5 className="text-lg font-bold text-gray-900 mb-4">
                    Students Competing for These Seats (Top {admissionData.eligibleStudents.length})
                  </h5>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {admissionData.eligibleStudents.map((student, index) => {
                      const isUser = student.roll === userRollNumber;
                      return (
                        <div
                          key={student.roll}
                          className={`p-4 rounded-lg border-2 ${
                            isUser 
                              ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200' 
                              : index < admissionData.availableSeats
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isUser ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
                              }`}>
                                #{index + 1}
                              </div>
                              <div>
                                <p className={`font-medium ${isUser ? 'text-yellow-800' : 'text-gray-900'}`}>
                                  {student.candidate_name} {isUser && '(YOU)'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Roll: {student.roll} | {student.domicile}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-indigo-600">#{student.air_rank}</p>
                              <p className="text-sm text-gray-500">{student.total_marks} marks</p>
                            </div>
                          </div>
                        {index < admissionData.availableSeats && (
                            <div className="mt-2">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Likely to get admission
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vacancy Information - Show First */}
        {vacancyStats && vacancies.length > 0 && (
  <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
      <School className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
      Seat Availability (Home State)
    </h3>
    
    {/* Summary Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
      <StatCard
        icon={Target}
        title="Total Home State Seats"
        value={vacancyStats.total_vacancies}
        subtitle="Seats matching your criteria"
        color="green"
      />
      
      <StatCard
        icon={School}
        title="Schools Available"
        value={vacancyStats.unique_schools}
        subtitle="Schools in your state"
        color="blue"
      />
    </div>

    {/* School-wise Vacancy List */}
    <div>
      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Schools in {filters.home_state || 'Your Selected Area'}
      </h4>
      
      {/* Mobile Layout - Compact Cards */}
      {/* REMOVED max-h-[600px] and overflow-y-auto */}
      <div className="block sm:hidden space-y-2"> 
        {vacancies.map((vacancy, index) => (
          <div
            key={vacancy.id || index}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="bg-green-100 text-green-700 rounded-md p-1.5 flex-shrink-0">
                  <School className="h-3 w-3" />
                </div>
                <h5 className="font-bold text-gray-900 text-sm leading-tight truncate">
                  {vacancy.school_name}
                </h5>
              </div>
              
              <div className="bg-white border border-green-200 rounded-md px-2 py-1 text-center flex-shrink-0">
                <p className="text-sm font-bold text-green-600">{vacancy.vacancies}</p>
                <p className="text-xs text-gray-500 font-medium">Seats</p>
              </div>
            </div>
            
            {/* Compact Details Row */}
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-0.5" />
                  {vacancy.state}
                </span>
                <span className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-0.5" />
                  C{vacancy.class_level}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {vacancy.gender}
                </span>
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                  {vacancy.category}
                </span>
              </div>
            </div>
            
            {vacancy.vacancies > 0 && (
              <button
                onClick={() => handleTrackAdmission(vacancy)}
                disabled={trackingLoading === vacancy.id}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1"
              >
                {trackingLoading === vacancy.id ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3 w-3" />
                    <span>Track</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tablet & Desktop Layout - Compact Table Style */}
      <div className="hidden sm:block">
        {/* REMOVED max-h-[500px] and overflow-y-auto */}
        <div className="bg-gray-50 rounded-lg overflow-hidden"> 
          {/* Table Header */}
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              <div className="col-span-4">School</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Details</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1 text-center">Seats</div>
              <div className="col-span-1 text-center">Action</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {vacancies.map((vacancy, index) => (
              <div
                key={vacancy.id || index}
                className="hover:bg-green-50 transition-colors duration-150 px-4 py-3"
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* School Name */}
                  <div className="col-span-4 flex items-center space-x-2">
                    <div className="bg-green-100 text-green-700 rounded-md p-1 flex-shrink-0">
                      <School className="h-3 w-3" />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm truncate">
                      {vacancy.school_name}
                    </span>
                  </div>
                  
                  {/* Location */}
                  <div className="col-span-2 text-sm text-gray-600 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{vacancy.state}</span>
                  </div>
                  
                  {/* Details */}
                  <div className="col-span-2 flex items-center space-x-2 text-xs text-gray-600">
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-0.5" />
                      Class {vacancy.class_level}th
                    </span>
                    <span className="flex items-center">
                      <Users2 className="h-3 w-3 mr-0.5" />
                      {vacancy.gender === 'Co-ed' ? 'Co-ed' : vacancy.gender}
                    </span>
                  </div>
                  
                  {/* Category */}
                  <div className="col-span-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {vacancy.category}
                    </span>
                  </div>
                  
                  {/* Seats Count */}
                  <div className="col-span-1 text-center">
                    <span className="text-lg font-bold text-green-600">
                      {vacancy.vacancies}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <div className="col-span-1 text-center">
                    {vacancy.vacancies > 0 && (
                      <button
                        onClick={() => handleTrackAdmission(vacancy)}
                        disabled={trackingLoading === vacancy.id}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-2 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1 w-full"
                      >
                        {trackingLoading === vacancy.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3" />
                            <span className="hidden lg:inline">Track</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>

)}
        {/* Students List */}
        {students.length > 0 && !selectedStudent && (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
    {/* List Header */}
    <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-indigo-600" />
            <span className="hidden sm:inline">All Class {filters.class_level} Students ({students.length} found)</span>
            <span className="sm:hidden">Class {filters.class_level} ({students.length})</span>
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            <span className="hidden sm:inline">Complete list of students</span>
          </p>
        </div>
        
        {vacancyStats && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-2 sm:p-3 text-xs sm:text-sm w-full sm:w-auto">
            <div className="text-center">
              <p className="font-bold text-green-700">{vacancyStats.total_vacancies} seats available</p>
              <p className="text-gray-600">in {vacancyStats.unique_schools} schools</p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Enhanced Student Cards */}
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="space-y-3 sm:space-y-4 max-h-[600px] sm:max-h-[700px] lg:max-h-[800px] overflow-y-auto">
        {getSortedStudents().map((student, index) => {
          const RankIcon = getRankIcon(student.air_rank);
          const rankColor = getRankColor(student.air_rank);
          const resultStatus = getResultStatus(student.result);
          const isUserStudent = userRollNumber && student.roll.toString().toLowerCase() === userRollNumber.toLowerCase();
          
          // Check if student is likely to get admission (top seats available)
          const isLikelyAdmission = vacancyStats && index < vacancyStats.total_vacancies;
          
          return (
            <div
              key={student.sl_no || index}
              onClick={() => handleStudentSelect(student)}
              className={`group p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isUserStudent 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 ring-2 ring-yellow-200' 
                  : isLikelyAdmission
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:border-green-400'
                    : 'border-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200'
              }`}
            >
              {/* Mobile Layout (< sm) */}
              <div className="block sm:hidden">
                <div className="flex items-start justify-between mb-3">
                  {/* Position & Student Name */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`text-white rounded-lg w-10 h-10 flex items-center justify-center text-xs font-bold shadow-lg flex-shrink-0 ${
                      isUserStudent 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    }`}>
                      #{index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-base leading-tight transition-colors truncate ${
                        isUserStudent 
                          ? 'text-orange-800' 
                          : 'text-gray-900 group-hover:text-indigo-700'
                      }`}>
                        {student.candidate_name} {isUserStudent && '(YOU)'}
                      </h4>
                      
                      {/* Mobile Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${resultStatus.bg} ${resultStatus.color}`}>
                          {resultStatus.status === 'qualified' ? 'Qualified' : 'Not Qualified'}
                        </div>
                        {isUserStudent && (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            Your Result
                          </div>
                        )}
                        {isLikelyAdmission && !isUserStudent && (
                          <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            Likely Admission
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Rank Icon */}
                  <div className={`rounded-lg p-2 ml-2 flex-shrink-0 ${rankColor}`}>
                    <RankIcon className="h-4 w-4" />
                  </div>
                </div>
                
                {/* Mobile Stats Row */}
                <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-lg p-3">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${isUserStudent ? 'text-orange-600' : 'text-indigo-600'}`}>
                      #{student.air_rank}
                    </p>
                    <p className="text-xs text-gray-500">AIR</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{student.total_marks}</p>
                    <p className="text-xs text-gray-500">Marks</p>
                  </div>
                  <div className="text-center">
                    <Eye className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">View</p>
                  </div>
                </div>
                
                {/* Mobile Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Roll: {student.roll}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{student.domicile}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{student.category}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{student.gender}</span>
                  </div>
                </div>
              </div>

              {/* Tablet & Desktop Layout (>= sm) */}
              <div className="hidden sm:flex items-center justify-between">
                {/* Left Section - Student Info */}
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  {/* Position Badge */}
                  <div className={`text-white rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0 ${
                    isUserStudent 
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  }`}>
                    #{index + 1}
                  </div>
                  
                  {/* Rank Icon with Color */}
                  <div className={`rounded-xl p-2 sm:p-3 flex-shrink-0 ${rankColor}`}>
                    <RankIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  
                  {/* Student Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-1">
                      <h4 className={`font-bold text-base sm:text-lg transition-colors truncate ${
                        isUserStudent 
                          ? 'text-orange-800' 
                          : 'text-gray-900 group-hover:text-indigo-700'
                      }`}>
                        {student.candidate_name} {isUserStudent && '(YOU)'}
                      </h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${resultStatus.bg} ${resultStatus.color}`}>
                        {resultStatus.status === 'qualified' ? 'Qualified' : 'Not Qualified'}
                      </div>
                      {isUserStudent && (
                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                          Your Result
                        </div>
                      )}
                      {isLikelyAdmission && !isUserStudent && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 hidden lg:block">
                          Likely to get Admission
                        </div>
                      )}
                      {isLikelyAdmission && !isUserStudent && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 lg:hidden">
                          Likely Admission
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>Roll: {student.roll}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="truncate">{student.domicile}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>{student.category}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>{student.gender}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Stats & Action */}
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="flex items-center justify-end space-x-2 sm:space-x-3 mb-2">
                    <div className="text-right">
                      <p className={`text-lg sm:text-2xl font-bold ${isUserStudent ? 'text-orange-600' : 'text-indigo-600'}`}>
                        #{student.air_rank}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="hidden sm:inline">All India Rank</span>
                        <span className="sm:hidden">AIR</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg sm:text-2xl font-bold text-green-600">{student.total_marks}</p>
                      <p className="text-xs text-gray-500">
                        <span className="hidden sm:inline">Total Marks</span>
                        <span className="sm:hidden">Marks</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end mt-2">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                    <span className={`text-xs sm:text-sm transition-colors ${
                      isUserStudent 
                        ? 'text-orange-600' 
                        : 'text-gray-500 group-hover:text-indigo-600'
                    }`}>
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}
        {/* Selected Student Details */}
        {selectedStudent && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ease-out p-4 sm:p-6"
    style={{
      opacity: '1',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }}
    onClick={(e) => {
      // Close modal when clicking on backdrop
      if (e.target === e.currentTarget) {
        setSelectedStudent(null);
      }
    }}
  >
    <div
      className="bg-white w-full max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-5xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative transform transition-transform duration-300 ease-out scale-100 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      style={{
        transform: 'scale(1)',
        opacity: '1',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Fixed Header with Close Button */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Student Details</h2>
        <button
          onClick={() => setSelectedStudent(null)}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
          aria-label="Close modal"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Basic Information</h3>
            <div className={`px-3 sm:px-4 py-2 rounded-full ${getResultStatus(selectedStudent.result).bg} w-full sm:w-auto`}>
              <div className="flex items-center justify-center sm:justify-start">
                {React.createElement(getResultStatus(selectedStudent.result).icon, {
                  className: `h-4 w-4 ${getResultStatus(selectedStudent.result).color} mr-2`
                })}
                <span className={`font-semibold text-sm sm:text-base ${getResultStatus(selectedStudent.result).color}`}>
                  {getResultStatus(selectedStudent.result).status === 'qualified' ? 'Qualified' : 'Not Qualified'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Stacked Cards */}
          <div className="block sm:hidden space-y-4">
            <StatCard icon={User} title="Name" value={selectedStudent.candidate_name} color="blue" />
            <StatCard icon={BookOpen} title="Roll Number" value={selectedStudent.roll} color="green" />
            <StatCard icon={MapPin} title="State" value={selectedStudent.domicile} color="purple" />
            <StatCard icon={Users} title="Category" value={selectedStudent.category} color="orange" />
          </div>

          {/* Tablet & Desktop Layout - Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard icon={User} title="Name" value={selectedStudent.candidate_name} color="blue" />
            <StatCard icon={BookOpen} title="Roll Number" value={selectedStudent.roll} color="green" />
            <StatCard icon={MapPin} title="State" value={selectedStudent.domicile} color="purple" />
            <StatCard icon={Users} title="Category" value={selectedStudent.category} color="orange" />
          </div>
        </div>

        {/* Performance Stats */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4 md:gap-6">
          <StatCard 
            icon={Award} 
            title="All India Rank" 
            value={`#${selectedStudent.air_rank}`} 
            subtitle="All India Rank" 
            color="indigo" 
          />
          <StatCard 
            icon={TrendingUp} 
            title="Total Marks" 
            value={selectedStudent.total_marks} 
            subtitle="Out of total" 
            color="green" 
          />
          <StatCard 
            icon={Target} 
            title="Gender" 
            value={selectedStudent.gender} 
            subtitle="Student category" 
            color="purple" 
          />
        </div>

        {/* Result Details */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4">Result Details</h3>
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
            <p className="text-gray-800 font-medium text-sm sm:text-base leading-relaxed">{selectedStudent.result}</p>
          </div>
        </div>

        
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default SainikRankTracker;