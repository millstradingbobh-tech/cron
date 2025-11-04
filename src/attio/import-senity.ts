import { createClient } from '@sanity/client';
import { Company } from './company-device';

const client = createClient({
  projectId: process.env.SENITY_PROJECT_ID || '',
  dataset: process.env.SENITY_DATASET || '',
  apiVersion: process.env.SENITY_API_VERSION || '', // or a more recent stable API version
  token: process.env.SENITY_TOKEN || '', // Ensure this token has delete permissions
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