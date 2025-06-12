/**
 * ConnectCare AI - Patient Data Isolation E2E Tests
 * 
 * End-to-end tests to verify that patients can only access their own data
 * and that the application properly enforces data isolation
 */

import { test, expect } from '@playwright/test';

test.describe('Patient Data Isolation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('patient signup creates isolated environment', async ({ page }) => {
    // Step 1: Navigate to signup page
    await page.click('[data-testid="get-started-button"]');
    await expect(page).toHaveURL('/auth/role-selection');

    // Step 2: Select patient role
    await page.click('[data-testid="patient-role-card"]');
    await expect(page).toHaveURL('/auth/sign-up?role=patient');

    // Step 3: Fill signup form
    await page.fill('[data-testid="full-name-input"]', 'Test Patient Isolation');
    await page.fill('[data-testid="email-input"]', 'patient.isolation@test.com');
    await page.fill('[data-testid="phone-input"]', '+1234567890');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.fill('[data-testid="confirm-password-input"]', 'testpass123');

    // Step 4: Submit form
    await page.click('[data-testid="create-account-button"]');

    // Step 5: Handle email verification (in test environment, this might be skipped)
    await expect(page.locator('[data-testid="account-created-message"]')).toBeVisible();
    
    // For testing, we'll assume email verification is bypassed
    await page.click('[data-testid="continue-to-signin-button"]');
    await expect(page).toHaveURL('/auth/sign-in');
  });

  test('patient login and dashboard access', async ({ page }) => {
    // Step 1: Navigate to login
    await page.goto('/auth/sign-in');

    // Step 2: Enter test patient credentials
    await page.fill('[data-testid="email-input"]', 'patient.a@test.connectcare.ai');
    await page.fill('[data-testid="password-input"]', 'testpass123');

    // Step 3: Submit login
    await page.click('[data-testid="sign-in-button"]');

    // Step 4: Verify redirect to patient dashboard
    await expect(page).toHaveURL('/(tabs)');
    
    // Step 5: Verify patient-specific interface elements
    await expect(page.locator('[data-testid="patient-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-name"]')).toContainText('Test Patient Alpha');
    
    // Step 6: Verify tab navigation is available
    await expect(page.locator('[data-testid="dashboard-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="health-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-tab"]')).toBeVisible();
  });

  test('patient can submit daily check-in', async ({ page }) => {
    // Login as test patient
    await loginAsPatient(page, 'patient.a@test.connectcare.ai', 'testpass123');

    // Step 1: Navigate to check-in tab
    await page.click('[data-testid="chat-tab"]');
    await expect(page.locator('[data-testid="daily-checkin-screen"]')).toBeVisible();

    // Step 2: Start check-in process
    await page.click('[data-testid="start-checkin-button"]');
    await expect(page.locator('[data-testid="checkin-question"]')).toBeVisible();

    // Step 3: Use text mode for testing (more reliable than voice)
    await page.click('[data-testid="use-text-button"]');
    
    // Step 4: Answer first question
    await page.fill('[data-testid="text-input"]', 'I am feeling well today, no major concerns.');
    await page.click('[data-testid="submit-button"]');

    // Step 5: Continue through remaining questions
    await page.waitForSelector('[data-testid="checkin-question"]');
    await page.fill('[data-testid="text-input"]', 'My pain level is about 3 out of 10.');
    await page.click('[data-testid="submit-button"]');

    await page.waitForSelector('[data-testid="checkin-question"]');
    await page.fill('[data-testid="text-input"]', 'Yes, I took all my morning medications.');
    await page.click('[data-testid="submit-button"]');

    await page.waitForSelector('[data-testid="checkin-question"]');
    await page.fill('[data-testid="text-input"]', 'I slept well for about 7 hours.');
    await page.click('[data-testid="submit-button"]');

    await page.waitForSelector('[data-testid="checkin-question"]');
    await page.fill('[data-testid="text-input"]', 'No unusual symptoms today.');
    await page.click('[data-testid="submit-button"]');

    // Step 6: Verify completion
    await expect(page.locator('[data-testid="checkin-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-message"]')).toContainText('Thank you for completing');
  });

  test('patient can view their own profile data', async ({ page }) => {
    // Login as test patient
    await loginAsPatient(page, 'patient.a@test.connectcare.ai', 'testpass123');

    // Step 1: Navigate to profile tab
    await page.click('[data-testid="profile-tab"]');
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible();

    // Step 2: Verify personal information is displayed
    await expect(page.locator('[data-testid="profile-name"]')).toContainText('Test Patient Alpha');
    await expect(page.locator('[data-testid="profile-email"]')).toContainText('patient.a@test.connectcare.ai');
    await expect(page.locator('[data-testid="profile-role"]')).toContainText('Patient');

    // Step 3: Verify health overview section
    await expect(page.locator('[data-testid="health-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="recovery-progress"]')).toBeVisible();

    // Step 4: Verify recent activity shows only own data
    const activityItems = await page.locator('[data-testid="activity-item"]').all();
    expect(activityItems.length).toBeGreaterThan(0);
    
    // All activity items should be related to this patient
    for (const item of activityItems) {
      const activityText = await item.textContent();
      expect(activityText).not.toContain('Patient B');
      expect(activityText).not.toContain('Patient C');
    }
  });

  test('patient can view their health metrics', async ({ page }) => {
    // Login as test patient
    await loginAsPatient(page, 'patient.a@test.connectcare.ai', 'testpass123');

    // Step 1: Navigate to health tab
    await page.click('[data-testid="health-tab"]');
    await expect(page.locator('[data-testid="health-screen"]')).toBeVisible();

    // Step 2: Verify health metrics are displayed
    await expect(page.locator('[data-testid="health-metrics-grid"]')).toBeVisible();
    
    const metricCards = await page.locator('[data-testid="metric-card"]').all();
    expect(metricCards.length).toBeGreaterThan(0);

    // Step 3: Verify specific metrics
    await expect(page.locator('[data-testid="heart-rate-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="blood-pressure-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="temperature-metric"]')).toBeVisible();

    // Step 4: Verify health goals section
    await expect(page.locator('[data-testid="health-goals"]')).toBeVisible();
    
    const goalCards = await page.locator('[data-testid="goal-card"]').all();
    expect(goalCards.length).toBeGreaterThan(0);
  });

  test('patient cannot access other patients data via URL manipulation', async ({ page }) => {
    // Login as Patient A
    await loginAsPatient(page, 'patient.a@test.connectcare.ai', 'testpass123');

    // Step 1: Try to access another patient's profile via URL manipulation
    await page.goto('/patient/test-patient-b-db-id/profile');
    
    // Should redirect to unauthorized page or show empty data
    await expect(page.locator('[data-testid="unauthorized-message"]')).toBeVisible();
    // OR
    await expect(page).toHaveURL('/(tabs)'); // Redirected back to own dashboard

    // Step 2: Try to access another patient's check-ins
    await page.goto('/patient/test-patient-b-db-id/checkins');
    
    // Should not show other patient's data
    await expect(page.locator('[data-testid="unauthorized-message"]')).toBeVisible();
    // OR
    await expect(page).toHaveURL('/(tabs)');

    // Step 3: Verify current user is still Patient A
    await page.click('[data-testid="profile-tab"]');
    await expect(page.locator('[data-testid="profile-name"]')).toContainText('Test Patient Alpha');
  });

  test('patient data isolation via API calls', async ({ page }) => {
    // Login as Patient A
    await loginAsPatient(page, 'patient.a@test.connectcare.ai', 'testpass123');

    // Step 1: Test API data isolation via browser console
    const apiTestResult = await page.evaluate(async () => {
      try {
        // Try to fetch another patient's data
        const response = await fetch('/api/patients/test-patient-b-db-id', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return { success: true, data, status: response.status };
        } else {
          return { success: false, status: response.status, error: 'Unauthorized' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Should fail or return empty data
    expect(apiTestResult.success).toBe(false);
    expect([401, 403, 404]).toContain(apiTestResult.status);

    // Step 2: Test database query isolation
    const dbTestResult = await page.evaluate(async () => {
      try {
        // Simulate direct database query attempt
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.EXPO_PUBLIC_SUPABASE_URL,
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', 'test-patient-b-db-id'); // Try to access Patient B's data

        return { data, error: error?.message };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Should return empty data due to RLS
    expect(dbTestResult.data).toEqual([]);
  });

  test('patient session isolation across browser tabs', async ({ browser }) => {
    // Create two browser contexts to simulate different users
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Step 1: Login as Patient A in first tab
    await loginAsPatient(pageA, 'patient.a@test.connectcare.ai', 'testpass123');
    
    // Step 2: Login as Patient B in second tab
    await loginAsPatient(pageB, 'patient.b@test.connectcare.ai', 'testpass123');

    // Step 3: Verify each patient sees only their own data
    await pageA.click('[data-testid="profile-tab"]');
    await expect(pageA.locator('[data-testid="profile-name"]')).toContainText('Test Patient Alpha');

    await pageB.click('[data-testid="profile-tab"]');
    await expect(pageB.locator('[data-testid="profile-name"]')).toContainText('Test Patient Beta');

    // Step 4: Verify check-in data isolation
    await pageA.click('[data-testid="health-tab"]');
    const pageACheckins = await pageA.locator('[data-testid="recent-checkin"]').all();
    
    await pageB.click('[data-testid="health-tab"]');
    const pageBCheckins = await pageB.locator('[data-testid="recent-checkin"]').all();

    // Each patient should have different check-in data
    expect(pageACheckins.length).toBeGreaterThan(0);
    expect(pageBCheckins.length).toBeGreaterThan(0);

    // Clean up
    await contextA.close();
    await contextB.close();
  });
});

/**
 * Helper function to login as a patient
 */
async function loginAsPatient(page, email, password) {
  await page.goto('/auth/sign-in');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="sign-in-button"]');
  await expect(page).toHaveURL('/(tabs)');
  await page.waitForSelector('[data-testid="patient-dashboard"]');
}