/**
 * ConnectCare AI - Doctor Access Control E2E Tests
 * 
 * End-to-end tests to verify that doctors can only access data for patients
 * assigned to them and that the application properly enforces access controls
 */

import { test, expect } from '@playwright/test';

test.describe('Doctor Access Control', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('doctor signup and profile creation', async ({ page }) => {
    // Step 1: Navigate to signup page
    await page.click('[data-testid="get-started-button"]');
    await expect(page).toHaveURL('/auth/role-selection');

    // Step 2: Select doctor role
    await page.click('[data-testid="doctor-role-card"]');
    await expect(page).toHaveURL('/auth/sign-up?role=doctor');

    // Step 3: Fill doctor signup form
    await page.fill('[data-testid="full-name-input"]', 'Dr. Test Access Control');
    await page.fill('[data-testid="email-input"]', 'doctor.access.test@test.com');
    await page.fill('[data-testid="phone-input"]', '+1234567890');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.fill('[data-testid="confirm-password-input"]', 'testpass123');

    // Step 4: Fill doctor-specific fields (if available in form)
    if (await page.locator('[data-testid="specialization-input"]').isVisible()) {
      await page.fill('[data-testid="specialization-input"]', 'Test Cardiology');
      await page.fill('[data-testid="license-number-input"]', 'TEST-DOC-ACCESS-001');
    }

    // Step 5: Submit form
    await page.click('[data-testid="create-account-button"]');

    // Step 6: Handle account creation confirmation
    await expect(page.locator('[data-testid="account-created-message"]')).toBeVisible();
  });

  test('doctor login and dashboard access', async ({ page }) => {
    // Step 1: Login as test doctor
    await loginAsDoctor(page, 'doctor.alpha@test.connectcare.ai', 'testpass123');

    // Step 2: Verify redirect to doctor dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Step 3: Verify doctor-specific interface elements
    await expect(page.locator('[data-testid="doctor-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="doctor-name"]')).toContainText('Dr. Test Alpha');
    
    // Step 4: Verify doctor navigation tabs
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="patients-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="monitoring-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="reports-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-tab"]')).toBeVisible();

    // Step 5: Verify dashboard statistics
    await expect(page.locator('[data-testid="total-patients-stat"]')).toBeVisible();
    await expect(page.locator('[data-testid="critical-cases-stat"]')).toBeVisible();
    await expect(page.locator('[data-testid="daily-checkins-stat"]')).toBeVisible();
  });

  test('doctor can view only assigned patients', async ({ page }) => {
    // Login as Dr. Alpha (assigned to Patients A and B)
    await loginAsDoctor(page, 'doctor.alpha@test.connectcare.ai', 'testpass123');

    // Step 1: Navigate to patients tab
    await page.click('[data-testid="patients-tab"]');
    await expect(page.locator('[data-testid="patients-list"]')).toBeVisible();

    // Step 2: Verify only assigned patients are visible
    const patientCards = await page.locator('[data-testid="patient-card"]').all();
    expect(patientCards.length).toBe(2); // Dr. Alpha should see only 2 patients

    // Step 3: Verify specific patients are shown
    const patientNames = [];
    for (const card of patientCards) {
      const nameElement = await card.locator('[data-testid="patient-name"]');
      const name = await nameElement.textContent();
      patientNames.push(name);
    }

    expect(patientNames).toContain('Test Patient Alpha');
    expect(patientNames).toContain('Test Patient Beta');
    expect(patientNames).not.toContain('Test Patient Gamma'); // Assigned to Dr. Beta

    // Step 4: Verify patient details are accessible
    await patientCards[0].click();
    await expect(page.locator('[data-testid="patient-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-vitals"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-checkins"]')).toBeVisible();
  });

  test('doctor can access check-ins for assigned patients', async ({ page }) => {
    // Login as Dr. Alpha
    await loginAsDoctor(page, 'doctor.alpha@test.connectcare.ai', 'testpass123');

    // Step 1: Navigate to monitoring tab
    await page.click('[data-testid="monitoring-tab"]');
    await expect(page.locator('[data-testid="monitoring-dashboard"]')).toBeVisible();

    // Step 2: Verify patient selector shows only assigned patients
    const patientOptions = await page.locator('[data-testid="patient-selector-option"]').all();
    expect(patientOptions.length).toBe(2); // Only assigned patients

    // Step 3: Select a patient and view their check-ins
    await page.click('[data-testid="patient-selector-option"]:first-child');
    
    // Step 4: Verify check-in data is displayed
    await expect(page.locator('[data-testid="patient-checkins-list"]')).toBeVisible();
    
    const checkinItems = await page.locator('[data-testid="checkin-item"]').all();
    expect(checkinItems.length).toBeGreaterThan(0);

    // Step 5: Verify check-in details
    await checkinItems[0].click();
    await expect(page.locator('[data-testid="checkin-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkin-vitals"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkin-notes"]')).toBeVisible();
  });

  test('doctor can create and manage notes for assigned patients', async ({ page }) => {
    // Login as Dr. Alpha
    await loginAsDoctor(page, 'doctor.alpha@test.connectcare.ai', 'testpass123');

    // Step 1: Navigate to patients tab and select a patient
    await page.click('[data-testid="patients-tab"]');
    await page.click('[data-testid="patient-card"]:first-child');

    // Step 2: Navigate to notes section
    await page.click('[data-testid="patient-notes-tab"]');
    await expect(page.locator('[data-testid="patient-notes-section"]')).toBeVisible();

    // Step 3: Create a new note
    await page.click('[data-testid="add-note-button"]');
    await expect(page.locator('[data-testid="note-creation-modal"]')).toBeVisible();

    // Step 4: Fill note details
    await page.selectOption('[data-testid="note-type-select"]', 'observation');
    await page.fill('[data-testid="note-title-input"]', 'Test Note from E2E Test');
    await page.fill('[data-testid="note-content-textarea"]', 'This is a test note created during E2E testing to verify doctor can create notes for assigned patients.');

    // Step 5: Save the note
    await page.click('[data-testid="save-note-button"]');
    await expect(page.locator('[data-testid="note-creation-modal"]')).not.toBeVisible();

    // Step 6: Verify note appears in the list
    await expect(page.locator('[data-testid="note-item"]').last()).toContainText('Test Note from E2E Test');

    // Step 7: Edit the note
    await page.click('[data-testid="note-item"]:last-child [data-testid="edit-note-button"]');
    await page.fill('[data-testid="note-content-textarea"]', 'Updated note content during E2E testing.');
    await page.click('[data-testid="save-note-button"]');

    // Step 8: Verify note was updated
    await expect(page.locator('[data-testid="note-item"]').last()).toContainText('Updated note content');
  });

  test('doctor cannot access unassigned patients data', async ({ page }) => {
    // Login as Dr. Alpha (should not see Patient C who is assigned to Dr. Beta)
    await loginAsDoctor(page, 'doctor.alpha@test.connectcare.ai', 'testpass123');

    // Step 1: Try to access unassigned patient via URL manipulation
    await page.goto('/dashboard/patients/test-patient-c-db-id');
    
    // Should redirect to unauthorized page or back to dashboard
    await expect(page.locator('[data-testid="unauthorized-message"]')).toBeVisible();
    // OR
    await expect(page).toHaveURL('/dashboard');

    // Step 2: Verify patients list doesn't include unassigned patients
    await page.click('[data-testid="patients-tab"]');
    const patientCards = await page.locator('[data-testid="patient-card"]').all();
    
    for (const card of patientCards) {
      const nameElement = await card.locator('[data-testid="patient-name"]');
      const name = await nameElement.textContent();
      expect(name).not.toContain('Test Patient Gamma'); // Should not see Dr. Beta's patient
    }

    // Step 3: Try to access unassigned patient's check-ins via API
    const apiTestResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/patients/test-patient-c-db-id/checkins', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        return { status: response.status, ok: response.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Should return unauthorized or empty data
    expect([401, 403, 404]).toContain(apiTestResult.status);
  });

  test('doctor can view dashboard statistics for assigned patients only', async ({ page }) => {
    // Login as Dr. Alpha
    await loginAsDoctor(page, 'doctor.alpha@test.connectcare.ai', 'testpass123');

    // Step 1: Verify overview tab shows correct statistics
    await page.click('[data-testid="overview-tab"]');
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();

    // Step 2: Verify patient count reflects only assigned patients
    const totalPatientsText = await page.locator('[data-testid="total-patients-stat"]').textContent();
    expect(totalPatientsText).toContain('2'); // Dr. Alpha has 2 assigned patients

    // Step 3: Verify critical cases count
    const criticalCasesText = await page.locator('[data-testid="critical-cases-stat"]').textContent();
    expect(criticalCasesText).toContain('1'); // Patient B is critical

    // Step 4: Verify today's appointments show only relevant appointments
    await expect(page.locator('[data-testid="todays-appointments"]')).toBeVisible();
    
    const appointmentItems = await page.locator('[data-testid="appointment-item"]').all();
    for (const item of appointmentItems) {
      const patientName = await item.locator('[data-testid="appointment-patient-name"]').textContent();
      expect(['Test Patient Alpha', 'Test Patient Beta']).toContain(patientName);
    }
  });

  test('doctor can switch to patient mode', async ({ page }) => {
    // Login as doctor
    await loginAsDoctor(page, 'doctor.alpha@test.connectcare.ai', 'testpass123');

    // Step 1: Click switch mode button
    await page.click('[data-testid="switch-mode-button"]');

    // Step 2: Verify redirect to patient interface
    await expect(page).toHaveURL('/(tabs)');
    
    // Step 3: Verify patient interface is shown
    await expect(page.locator('[data-testid="patient-dashboard"]')).toBeVisible();
    
    // Step 4: Verify doctor can see their own patient data
    await page.click('[data-testid="profile-tab"]');
    await expect(page.locator('[data-testid="profile-name"]')).toContainText('Dr. Test Alpha');
    await expect(page.locator('[data-testid="profile-role"]')).toContainText('Doctor');
  });

  test('multiple doctors have isolated access', async ({ browser }) => {
    // Create two browser contexts for different doctors
    const contextAlpha = await browser.newContext();
    const contextBeta = await browser.newContext();
    
    const pageAlpha = await contextAlpha.newPage();
    const pageBeta = await contextBeta.newPage();

    // Step 1: Login as Dr. Alpha and Dr. Beta
    await loginAsDoctor(pageAlpha, 'doctor.alpha@test.connectcare.ai', 'testpass123');
    await loginAsDoctor(pageBeta, 'doctor.beta@test.connectcare.ai', 'testpass123');

    // Step 2: Verify each doctor sees different patient counts
    await pageAlpha.click('[data-testid="patients-tab"]');
    const alphaPatients = await pageAlpha.locator('[data-testid="patient-card"]').all();
    
    await pageBeta.click('[data-testid="patients-tab"]');
    const betaPatients = await pageBeta.locator('[data-testid="patient-card"]').all();

    expect(alphaPatients.length).toBe(2); // Dr. Alpha: Patients A, B
    expect(betaPatients.length).toBe(2);  // Dr. Beta: Patients C, D

    // Step 3: Verify different patient names
    const alphaPatientNames = [];
    for (const card of alphaPatients) {
      const name = await card.locator('[data-testid="patient-name"]').textContent();
      alphaPatientNames.push(name);
    }

    const betaPatientNames = [];
    for (const card of betaPatients) {
      const name = await card.locator('[data-testid="patient-name"]').textContent();
      betaPatientNames.push(name);
    }

    // Verify no overlap in patient assignments
    expect(alphaPatientNames).toEqual(['Test Patient Alpha', 'Test Patient Beta']);
    expect(betaPatientNames).toEqual(['Test Patient Gamma', 'Test Patient Delta']);

    // Clean up
    await contextAlpha.close();
    await contextBeta.close();
  });

  test('doctor real-time notifications for assigned patients', async ({ page }) => {
    // This test would require a second browser context to simulate patient check-in
    // For now, we'll test the notification system setup
    
    // Login as Dr. Alpha
    await loginAsDoctor(page, 'doctor.alpha@test.connectcare.ai', 'testpass123');

    // Step 1: Navigate to monitoring dashboard
    await page.click('[data-testid="monitoring-tab"]');
    await expect(page.locator('[data-testid="monitoring-dashboard"]')).toBeVisible();

    // Step 2: Verify real-time monitoring is available
    await expect(page.locator('[data-testid="realtime-status"]')).toBeVisible();
    
    // Step 3: Check notification settings
    await page.click('[data-testid="notification-settings-button"]');
    await expect(page.locator('[data-testid="notification-preferences"]')).toBeVisible();
    
    // Step 4: Verify notification types are configurable
    await expect(page.locator('[data-testid="critical-alerts-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkin-notifications-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="medication-alerts-toggle"]')).toBeVisible();
  });
});

/**
 * Helper function to login as a doctor
 */
async function loginAsDoctor(page, email, password) {
  await page.goto('/auth/sign-in');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="sign-in-button"]');
  await expect(page).toHaveURL('/dashboard');
  await page.waitForSelector('[data-testid="doctor-dashboard"]');
}