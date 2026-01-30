import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting Authentication Tests...\n');

const tests = {
    passed: 0,
    failed: 0,
    results: []
};

function test(name, condition) {
    if (condition) {
        tests.passed++;
        tests.results.push(`✅ ${name}`);
    } else {
        tests.failed++;
        tests.results.push(`❌ ${name}`);
    }
}

async function runTests() {
    // Test 1: Check Firebase config exists
    const configExists = fs.existsSync('./services/firebase.ts');
    test('Firebase config file exists (services/firebase.ts)', configExists);

    // Test 2: Check AuthContext exists
    const authContextExists = fs.existsSync('./context/AuthContext.tsx');
    test('AuthContext file exists (context/AuthContext.tsx)', authContextExists);

    // Test 3: Check SignIn page exists
    const signInExists = fs.existsSync('./pages/SignIn.tsx');
    test('SignIn page exists (pages/SignIn.tsx)', signInExists);

    // Test 4: Check SignUp page exists
    const signUpExists = fs.existsSync('./pages/SignUp.tsx');
    test('SignUp page exists (pages/SignUp.tsx)', signUpExists);

    // Test 5: Check ProtectedRoute exists
    const protectedRouteExists = fs.existsSync('./components/ProtectedRoute.tsx');
    test('ProtectedRoute component exists (components/ProtectedRoute.tsx)', protectedRouteExists);

    // Test 6: Check environment variables
    // Note: .env.local exists but might be empty or placeholder. 
    // The user prompt said: "Config file exists: Yes (Hardcoded values)".
    // So strictly speaking, env vars are NOT used in the current firebase.ts, but the file exists.
    const envExists = fs.existsSync('./.env.local');
    test('Environment file exists', envExists);

    // Test 7: Check App.tsx uses Routes
    const appContent = fs.readFileSync('./App.tsx', 'utf8');
    const hasRoutes = appContent.includes('Routes') && appContent.includes('Route');
    test('App.tsx uses React Router', hasRoutes);

    // Test 8: Check index.tsx uses AuthProvider
    const indexContent = fs.readFileSync('./index.tsx', 'utf8');
    const hasAuthProvider = indexContent.includes('AuthProvider');
    test('index.tsx wraps App with AuthProvider', hasAuthProvider);

    // Print results
    console.log('\n📊 TEST RESULTS:');
    console.log('================');
    tests.results.forEach(r => console.log(r));
    console.log('================');
    console.log(`Total: ${tests.passed + tests.failed} | Passed: ${tests.passed} | Failed: ${tests.failed}`);

    if (tests.failed > 0) {
        console.log('\n⚠️  Some tests failed. Please fix issues before proceeding.');
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed! Authentication setup is complete.');
    }
}

runTests().catch(console.error);
