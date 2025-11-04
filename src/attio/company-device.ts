import { importSenity } from "./import-senity";

export interface Company {name: string; companyDevices?: string}

const AUTH_TOKEN = process.env.ATTIO_TOKEN || '';
const API_PREFIX = process.env.ATTIO_API_PREFIX || '';

const companyDevice = async () => {

    const returnValue = [];

    const myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_TOKEN);
    myHeaders.append("Content-Type", 'application/json');

    const postResult = await fetch(API_PREFIX + '/companies/records/query', {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
    });

    const companies = (await postResult.json()).data;
    // company data consolidate here

    for (const company of companies) {
        const companyId = company?.id?.record_id || '';

        // console.log('company name: ', company.values.name?.[0].value)
        const companyObj: Company = {
            name: company.values.name?.[0].value
        };

        if (!companyId) {
            continue;
        }

        const deviceGetResult = await fetch(`${API_PREFIX}/companies/records/${companyId}/attributes/deviceid/values`, {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        });

        const devices = (await deviceGetResult.json()).data;

        // console.log(devices);

        if (devices.length > 0) {
            companyObj.companyDevices = '';

            for (const device of devices) {
                const recordId = device?.target_record_id;

                if (!recordId) {
                    continue;
                }

                const deviceAttributeGetResult = await fetch(`${API_PREFIX}/partners/records/${recordId}`, {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow'
                });

                const deviceAttributes = (await deviceAttributeGetResult.json()).data;
                // console.log(deviceAttributes)
                if (deviceAttributes?.values?.kiosk_id) {
                    companyObj.companyDevices += (deviceAttributes?.values?.kiosk_id?.[0].value) + '|';
                    console.log('kiosk name: ', deviceAttributes?.values?.kiosk_id?.[0].value);
                }
            }
            
            if (companyObj.companyDevices[companyObj.companyDevices.length - 1] === '|') {
                companyObj.companyDevices = companyObj.companyDevices.slice(0, -1);
            }
        }

        returnValue.push(companyObj);
        
    }

    await importSenity(returnValue);

    return false;
}

export { companyDevice };