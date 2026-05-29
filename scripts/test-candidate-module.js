
// scripts/test-candidate-module.js
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

// Test user credentials (must exist in database from seeding)
const TEST_CANDIDATE = {
  email: 'candidate@example.com',
  password: 'password123',
};

// Store cookies and data between tests
let authCookie = '';
let testJobId = null;
let testApplicationId = null;
let uploadedResumeUrl = null;

// Helper function to make authenticated requests
async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authCookie && { Cookie: authCookie }),
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);
  const data = await response.json();
  
  return { response, data };
}

// Helper to log test results
function logTest(name, passed, details = null) {
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} ${name}`);
  if (details) {
    console.log(`   📝 ${details}`);
  }
}

// Helper to log section headers
function logSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`📌 ${title}`);
  console.log('='.repeat(60));
}

// ============================================
// TEST 1: Login as Candidate
// ============================================
async function testLogin() {
  logSection('TEST 1: Login as Candidate');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CANDIDATE),
    });
    
    const data = await response.json();
    
    // Extract cookie from response headers
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      authCookie = setCookie.split(';')[0];
    }
    
    const passed = response.ok && data.success;
    logTest('Login', passed, passed ? `Logged in as ${TEST_CANDIDATE.email}` : data.message);
    
    return passed;
  } catch (error) {
    logTest('Login', false, error.message);
    return false;
  }
}

// ============================================
// TEST 2: Get Candidate Profile
// ============================================
async function testGetProfile() {
  logSection('TEST 2: Get Candidate Profile');
  
  try {
    const { response, data } = await fetchAPI('/api/candidate/profile');
    
    const passed = response.ok && data.success;
    logTest('GET /api/candidate/profile', passed, passed ? `Profile: ${data.data.profile?.first_name} ${data.data.profile?.last_name}` : data.message);
    
    if (passed && data.data) {
      console.log(`   📊 Profile Completion: ${data.data.profile_completion}%`);
      console.log(`   🛠️ Skills: ${data.data.skills.length}`);
      console.log(`   📧 Email: ${data.data.user.email}`);
    }
    
    return passed;
  } catch (error) {
    logTest('GET /api/candidate/profile', false, error.message);
    return false;
  }
}

// ============================================
// TEST 3: Update Candidate Profile
// ============================================
async function testUpdateProfile() {
  logSection('TEST 3: Update Candidate Profile');
  
  try {
    const updatedData = {
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      headline: 'Senior Full Stack Developer | React Expert',
      summary: 'Passionate developer with 6+ years of experience building scalable web applications.',
      years_experience: 6,
      current_job_title: 'Senior Developer',
      current_company: 'Tech Corp',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      github_url: 'https://github.com/johndoe',
      portfolio_url: 'https://johndoe.dev',
    };
    
    const { response, data } = await fetchAPI('/api/candidate/profile', {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
    
    const passed = response.ok && data.success;
    logTest('PUT /api/candidate/profile', passed, passed ? 'Profile updated successfully' : data.message);
    
    return passed;
  } catch (error) {
    logTest('PUT /api/candidate/profile', false, error.message);
    return false;
  }
}

// ============================================
// TEST 4: Upload Resume
// ============================================
async function testUploadResume() {
  logSection('TEST 4: Upload Resume');
  
  try {
    // Create a simple text file as mock resume
    const resumeContent = 'John Doe\nSenior Developer\n6+ years experience\nSkills: React, TypeScript, Node.js';
    const blob = new Blob([resumeContent], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('resume', blob, 'john_doe_resume.pdf');
    
    const response = await fetch(`${BASE_URL}/api/candidate/resume`, {
      method: 'POST',
      headers: {
        'Cookie': authCookie,
      },
      body: formData,
    });
    
    const data = await response.json();
    
    const passed = response.ok && data.success;
    if (passed) {
      uploadedResumeUrl = data.data.resume_url;
      logTest('POST /api/candidate/resume', passed, `Resume uploaded: ${data.data.file_name}`);
    } else {
      logTest('POST /api/candidate/resume', passed, data.message);
    }
    
    return passed;
  } catch (error) {
    logTest('POST /api/candidate/resume', false, error.message);
    return false;
  }
}

// ============================================
// TEST 5: View All Jobs
// ============================================
async function testViewJobs() {
  logSection('TEST 5: View All Jobs');
  
  try {
    const { response, data } = await fetchAPI('/api/jobs?page=1&limit=10');
    
    const passed = response.ok && data.success;
    logTest('GET /api/jobs', passed, passed ? `Found ${data.data.pagination.total} jobs` : data.message);
    
    if (passed && data.data.jobs.length > 0) {
      console.log(`   📋 First job: ${data.data.jobs[0].title} at ${data.data.jobs[0].company_name}`);
      testJobId = data.data.jobs[0].id;
    }
    
    return passed;
  } catch (error) {
    logTest('GET /api/jobs', false, error.message);
    return false;
  }
}

// ============================================
// TEST 6: View Job Details
// ============================================
async function testJobDetails() {
  logSection('TEST 6: View Job Details');
  
  if (!testJobId) {
    logTest('GET /api/jobs/:id', false, 'No job ID available from previous test');
    return false;
  }
  
  try {
    const { response, data } = await fetchAPI(`/api/jobs/${testJobId}`);
    
    const passed = response.ok && data.success;
    logTest(`GET /api/jobs/${testJobId}`, passed, passed ? `Job: ${data.data.job.title}` : data.message);
    
    if (passed && data.data) {
      console.log(`   🏢 Company: ${data.data.job.company_name}`);
      console.log(`   📍 Location: ${data.data.job.location}`);
      console.log(`   💰 Salary: $${data.data.job.salary_min} - $${data.data.job.salary_max}`);
      console.log(`   📝 Has Applied: ${data.data.has_applied}`);
    }
    
    return passed;
  } catch (error) {
    logTest('GET /api/jobs/:id', false, error.message);
    return false;
  }
}

// ============================================
// TEST 7: Apply to Job
// ============================================
async function testApplyToJob() {
  logSection('TEST 7: Apply to Job');
  
  if (!testJobId) {
    logTest('POST /api/jobs/:id/apply', false, 'No job ID available');
    return false;
  }
  
  try {
    const applicationData = {
      cover_letter: 'I am very excited about this opportunity. With my 6 years of experience in full-stack development, I believe I would be a great fit for this role.',
      use_saved_resume: true,
    };
    
    const { response, data } = await fetchAPI(`/api/jobs/${testJobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
    
    const passed = response.ok && data.success;
    
    if (passed) {
      testApplicationId = data.data.application_id;
      logTest(`POST /api/jobs/${testJobId}/apply`, passed, `Application submitted! ID: ${testApplicationId}`);
    } else {
      logTest(`POST /api/jobs/${testJobId}/apply`, passed, data.message);
    }
    
    return passed;
  } catch (error) {
    logTest('POST /api/jobs/:id/apply', false, error.message);
    return false;
  }
}

// ============================================
// TEST 8: View All Applications
// ============================================
async function testViewApplications() {
  logSection('TEST 8: View All Applications');
  
  try {
    const { response, data } = await fetchAPI('/api/applications?page=1&limit=10');
    
    const passed = response.ok && data.success;
    logTest('GET /api/applications', passed, passed ? `Found ${data.data.pagination.total} applications` : data.message);
    
    if (passed && data.data) {
      console.log(`   📊 Status Summary:`);
      console.log(`      Pending: ${data.data.status_summary.pending}`);
      console.log(`      Reviewed: ${data.data.status_summary.reviewed}`);
      console.log(`      Shortlisted: ${data.data.status_summary.shortlisted}`);
      console.log(`      Rejected: ${data.data.status_summary.rejected}`);
      console.log(`      Hired: ${data.data.status_summary.hired}`);
      
      if (data.data.applications.length > 0) {
        console.log(`   📋 Latest application: ${data.data.applications[0].job_title} - Status: ${data.data.applications[0].status}`);
      }
    }
    
    return passed;
  } catch (error) {
    logTest('GET /api/applications', false, error.message);
    return false;
  }
}

// ============================================
// TEST 9: View Application Details
// ============================================
async function testApplicationDetails() {
  logSection('TEST 9: View Application Details');
  
  if (!testApplicationId) {
    logTest('GET /api/applications/:id', false, 'No application ID available');
    return false;
  }
  
  try {
    const { response, data } = await fetchAPI(`/api/applications/${testApplicationId}`);
    
    const passed = response.ok && data.success;
    logTest(`GET /api/applications/${testApplicationId}`, passed, passed ? `Application for: ${data.data.application.job_title}` : data.message);
    
    if (passed && data.data) {
      console.log(`   📝 Status: ${data.data.application.status}`);
      console.log(`   📅 Applied: ${new Date(data.data.application.applied_date).toLocaleDateString()}`);
      console.log(`   📊 Timeline steps: ${data.data.timeline.length}`);
    }
    
    return passed;
  } catch (error) {
    logTest('GET /api/applications/:id', false, error.message);
    return false;
  }
}

// ============================================
// TEST 10: Get Skills (Shared API)
// ============================================
async function testGetSkills() {
  logSection('TEST 10: Get Skills (Shared API)');
  
  try {
    const { response, data } = await fetchAPI('/api/skills');
    
    const passed = response.ok && data.success;
    logTest('GET /api/skills', passed, passed ? `Found ${data.data.skills.length} skills` : data.message);
    
    if (passed && data.data) {
      console.log(`   📂 Categories: ${data.data.categories.slice(0, 5).join(', ')}${data.data.categories.length > 5 ? '...' : ''}`);
    }
    
    return passed;
  } catch (error) {
    logTest('GET /api/skills', false, error.message);
    return false;
  }
}

// ============================================
// TEST 11: Get Companies (Shared API)
// ============================================
async function testGetCompanies() {
  logSection('TEST 11: Get Companies (Shared API)');
  
  try {
    const { response, data } = await fetchAPI('/api/companies');
    
    const passed = response.ok && data.success;
    logTest('GET /api/companies', passed, passed ? `Found ${data.data.pagination.total} companies` : data.message);
    
    return passed;
  } catch (error) {
    logTest('GET /api/companies', false, error.message);
    return false;
  }
}

// ============================================
// TEST 12: Get Notifications (Shared API)
// ============================================
async function testGetNotifications() {
  logSection('TEST 12: Get Notifications (Shared API)');
  
  try {
    const { response, data } = await fetchAPI('/api/notifications');
    
    const passed = response.ok && data.success;
    logTest('GET /api/notifications', passed, passed ? `Unread count: ${data.data.unread_count}` : data.message);
    
    return passed;
  } catch (error) {
    logTest('GET /api/notifications', false, error.message);
    return false;
  }
}

// ============================================
// TEST 13: Logout
// ============================================
async function testLogout() {
  logSection('TEST 13: Logout');
  
  try {
    const { response, data } = await fetchAPI('/api/auth/logout', {
      method: 'POST',
    });
    
    const passed = response.ok && data.success;
    logTest('POST /api/auth/logout', passed, passed ? 'Logged out successfully' : data.message);
    
    return passed;
  } catch (error) {
    logTest('POST /api/auth/logout', false, error.message);
    return false;
  }
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🧪 CANDIDATE MODULE TEST SUITE                        ║');
  console.log('║     Testing all 8 candidate features + shared APIs        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  // Step 1: Login
  results.push(await testLogin());
  if (!results[0]) {
    console.log('\n❌ Cannot proceed: Login failed. Make sure server is running and test user exists.');
    console.log('   Run: npm run db:seed to create test users');
    return;
  }
  
  // Step 2-12: Run all tests
  results.push(await testGetProfile());
  results.push(await testUpdateProfile());
  results.push(await testUploadResume());
  results.push(await testViewJobs());
  results.push(await testJobDetails());
  results.push(await testApplyToJob());
  results.push(await testViewApplications());
  results.push(await testApplicationDetails());
  results.push(await testGetSkills());
  results.push(await testGetCompanies());
  results.push(await testGetNotifications());
  results.push(await testLogout());
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`   ✅ Passed: ${passed}/${total} (${percentage}%)`);
  console.log(`   ❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Candidate module is ready.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Fix any failing tests');
  console.log('   2. Proceed to Phase 4: Recruiter Module');
}

// Run the tests
runAllTests().catch(console.error);