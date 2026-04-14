import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Create Organisation' }).click();
  await page.getByRole('link', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Request an account' }).click();
  await page.getByRole('link', { name: 'Log in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.TEST_USER_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.TEST_USER_PW!);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'View All Tasks' }).click();
  await page.getByRole('button', { name: 'List View' }).click();
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('link', { name: 'Users' }).click();
  await page.getByRole('button', { name: 'Requests(3)' }).click();
  await page.getByRole('link', { name: 'Organisation' }).click();
  await page.getByRole('button', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'View Profile' }).click();
  await page.getByRole('link', { name: 'TaskUS Logo' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
});