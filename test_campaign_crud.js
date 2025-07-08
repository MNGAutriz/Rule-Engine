const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/campaigns';

async function testCampaignCRUD() {
  console.log('Testing Campaign CRUD Operations...\n');

  try {
    // 1. Get all campaigns
    console.log('1. Getting all campaigns...');
    const getAllResponse = await axios.get(BASE_URL);
    console.log(`✅ Found ${getAllResponse.data.length} campaigns`);
    const initialCount = getAllResponse.data.length;

    // 2. Create a new campaign
    console.log('\n2. Creating a new campaign...');
    const newCampaign = {
      campaignCode: 'TEST_CAMPAIGN_2025',
      name: 'Test Campaign',
      market: 'HK',
      channel: 'ALL',
      brand: 'P&G',
      startDate: '2025-07-01T00:00:00Z',
      endDate: '2025-07-31T23:59:59Z',
      ruleIds: ['TEST_RULE'],
      priority: 10,
      description: 'This is a test campaign',
      terms: 'Test terms and conditions'
    };

    const createResponse = await axios.post(BASE_URL, newCampaign);
    console.log(`✅ Campaign created: ${createResponse.data.campaign.campaignCode}`);

    // 3. Verify campaign was created
    console.log('\n3. Verifying campaign was created...');
    const getAllAfterCreateResponse = await axios.get(BASE_URL);
    console.log(`✅ Total campaigns now: ${getAllAfterCreateResponse.data.length} (was ${initialCount})`);

    // 4. Update the campaign
    console.log('\n4. Updating the campaign...');
    const updateData = {
      name: 'Updated Test Campaign',
      description: 'This is an updated test campaign'
    };

    const updateResponse = await axios.put(`${BASE_URL}/${newCampaign.campaignCode}`, updateData);
    console.log(`✅ Campaign updated: ${updateResponse.data.campaign.name}`);

    // 5. Delete the campaign
    console.log('\n5. Deleting the test campaign...');
    const deleteResponse = await axios.delete(`${BASE_URL}/${newCampaign.campaignCode}`);
    console.log(`✅ Campaign deleted: ${deleteResponse.data.message}`);

    // 6. Verify campaign was deleted
    console.log('\n6. Verifying campaign was deleted...');
    const getAllAfterDeleteResponse = await axios.get(BASE_URL);
    console.log(`✅ Total campaigns now: ${getAllAfterDeleteResponse.data.length} (back to ${initialCount})`);

    console.log('\n🎉 All CRUD operations completed successfully!');

  } catch (error) {
    console.error('❌ Error during CRUD operations:', error.response?.data || error.message);
  }
}

// Run the test
testCampaignCRUD();
