import requests
import sys
import json
from datetime import datetime

class CognitiveArenaAPITester:
    def __init__(self, base_url="https://cognition-arena.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_username = f"test_user_{datetime.now().strftime('%H%M%S')}"
        self.test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_password = "TestPass123!"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "username": self.test_username,
                "email": self.test_email,
                "password": self.test_password
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            if 'user' in response:
                self.user_id = response['user'].get('id')
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data={
                "username": self.test_username,
                "password": self.test_password
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            if 'user' in response:
                self.user_id = response['user'].get('id')
            print(f"   Login token: {self.token[:20]}...")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user profile"""
        if not self.token:
            print("❌ No token available for authentication test")
            return False
            
        return self.run_test("Get Current User", "GET", "auth/me", 200)[0]

    def test_ai_image_game_data(self):
        """Test AI Image game data endpoint"""
        if not self.token:
            print("❌ No token available for AI Image game data test")
            return False
            
        success, response = self.run_test("AI Image Game Data", "GET", "games/ai-image/data", 200)
        
        if success and 'images' in response:
            images = response['images']
            print(f"   Retrieved {len(images)} images")
            for img in images:
                print(f"   - Image {img.get('id')}: {img.get('description')} (AI: {img.get('is_ai')})")
            return True
        return False

    def test_text_ai_game_data(self):
        """Test Text AI game data endpoint"""
        if not self.token:
            print("❌ No token available for Text AI game data test")
            return False
            
        success, response = self.run_test("Text AI Game Data", "GET", "games/text-ai/data", 200)
        
        if success and 'texts' in response:
            texts = response['texts']
            print(f"   Retrieved {len(texts)} texts")
            for text in texts:
                print(f"   - Text {text.get('id')}: AI={text.get('is_ai')}")
            return True
        return False

    def test_memory_game_data(self):
        """Test Memory game data endpoint"""
        if not self.token:
            print("❌ No token available for Memory game data test")
            return False
            
        success, response = self.run_test("Memory Game Data", "GET", "games/memory/data?difficulty=1", 200)
        
        if success and 'sequence' in response:
            sequence = response['sequence']
            difficulty = response.get('difficulty', 1)
            print(f"   Retrieved sequence of length {len(sequence)} for difficulty {difficulty}")
            print(f"   Sequence: {sequence}")
            return True
        return False

    def test_submit_game_score(self):
        """Test submitting a game score"""
        if not self.token:
            print("❌ No token available for score submission test")
            return False
            
        test_score_data = {
            "game_type": "ai_image",
            "score": 850,
            "accuracy": 85.0,
            "time_taken": 120
        }
        
        success, response = self.run_test(
            "Submit Game Score",
            "POST",
            "games/score",
            200,
            data=test_score_data
        )
        
        if success:
            print(f"   Your score: {response.get('your_score')}")
            print(f"   AI baseline: {response.get('ai_baseline')}")
            print(f"   Performance: {response.get('performance')}")
            return True
        return False

    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        success, response = self.run_test("Leaderboard", "GET", "leaderboard", 200)
        
        if success:
            human_leaders = response.get('human_leaders', [])
            ai_baselines = response.get('ai_baselines', [])
            print(f"   Human leaders: {len(human_leaders)}")
            print(f"   AI baselines: {len(ai_baselines)}")
            
            for ai in ai_baselines:
                print(f"   - {ai.get('name')}: {ai.get('total_score')} points")
            return True
        return False

    def test_user_stats(self):
        """Test user stats endpoint"""
        if not self.token:
            print("❌ No token available for user stats test")
            return False
            
        success, response = self.run_test("User Stats", "GET", "stats/user", 200)
        
        if success:
            user_stats = response.get('user_stats', {})
            total_games = response.get('total_games', 0)
            print(f"   Total games played: {total_games}")
            
            for game_type, stats in user_stats.items():
                print(f"   {game_type}: {stats.get('games_played')} games, {stats.get('best_score')} best score")
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Cognitive Arena API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Test basic connectivity
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed, stopping tests")
            return False

        # Test authentication flow
        if not self.test_user_registration():
            print("❌ User registration failed, stopping tests")
            return False

        if not self.test_get_current_user():
            print("❌ Get current user failed")
            return False

        # Test game data endpoints
        if not self.test_ai_image_game_data():
            print("❌ AI Image game data failed")

        if not self.test_text_ai_game_data():
            print("❌ Text AI game data failed")

        if not self.test_memory_game_data():
            print("❌ Memory game data failed")

        # Test score submission
        if not self.test_submit_game_score():
            print("❌ Score submission failed")

        # Test leaderboard and stats
        if not self.test_leaderboard():
            print("❌ Leaderboard failed")

        if not self.test_user_stats():
            print("❌ User stats failed")

        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 Final Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = CognitiveArenaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())