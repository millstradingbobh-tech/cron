import { createClient } from '@sanity/client';
import { Company } from './company-device';

const client = createClient({
  projectId: 'je8kjwqv',
  dataset: 'production',
  apiVersion: '2025-11-04', // or a more recent stable API version
  token: 'sk2AhQ0DA4cw3FyuTRBznDSsQZ97FNJJsebdeJabIUIubsZtlgM5KUWKajG2te9CkcSA5o5tKZuXqhcjHuVFlm5Su3XO8tyiUn3RA2vk0GzE5263rVNacw0qY0mPklMm8NrWK17xPLtL7SMGZMKO9Y7ztSWj23aFztzAJJBqsOsOIRNaEJWR', // Ensure this token has delete permissions
});

// To delete a document
const importSenity = async (dataArray: Company[]) => {
    console.log(dataArray)

    const groqQueryToDelete = '*[_type == "company"]'; // Example: delete all unpublished posts
    client
    .delete({ query: groqQueryToDelete })
    .then((result) => {
        console.log('Documents deleted:', result);
    })
    .catch((error) => {
        console.error('Error deleting documents:', error);
    });
    for (const company of dataArray) {
        const newData = {
            _type: 'company', // The schema type of your document
            name: company.name,
            devices: company.companyDevices,
        };
        
        try {
            const createdDocument = await client.create(newData);
            console.log('Document created:', createdDocument);
        } catch (error) {
            console.error('Error creating document:', error);
        }
    }
    
}

export {importSenity};