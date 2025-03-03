const prompt = require('prompt-sync')();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Customer = require('./models/customer.js')

const connect = async () => {
    // Connect to MongoDB using the MONGODB_URI specified in our .env file.
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
};

const createCustomer = async (customerData) => {
    const customer = await Customer.create(customerData);
    console.log('New Customer: ', customer);
}

const getCustomers = async () => {
    try {
        const customers = await Customer.find();
        if (customers.length === 0) {
            console.log('No Customers found.');
        } else {
            console.log('\nBelow is a list of customers:');
            customers.forEach((customer, index) => {
                console.log(`id: ${customer.id} --  Name: ${customer.name}, Age: ${customer.age}`);
            });
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
};

const updateCustomer = async (id, customerData) => {
    const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        {
            name: customerData.name,
            age: customerData.age
        },
        { new: true },
    )
    console.log('Updated Customer:', updatedCustomer);
}

const deleteCustomer = async (id) => {
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    console.log('Removed todo:', deletedCustomer);
}

// APP
const main = async () => {
    await connect();

    let quit = false

    while (!quit) {
        console.log(`
        Welcome to the CRM
            
        What would you like to do?
        
            1. Create a customer
            2. View all customers
            3. Update a customer
            4. Delete a customer
            5. Quit
            `);

        const userInput = prompt('Number of action to run: ');

        switch (userInput) {
            case '1':
                const nameInput = prompt('Name: ');
                const ageInput = prompt('Age: ');

                const customerData = {
                    name: nameInput,
                    age: parseInt(ageInput, 10),
                }

                await createCustomer(customerData);
                break;
            case '2':
                await getCustomers();
                break;
            case '3':
                await getCustomers();
                const idInput = prompt('Copy and paste the id of the customer you would like to update here:');
                const nameInput2 = prompt('What is the customers new name?');
                const ageInput2 = prompt('What is the customers new age?');
                const customerData2 = {
                    name: nameInput2,
                    age: parseInt(ageInput2, 10),
                }
                await updateCustomer(idInput, customerData2);
                break;
            case '4':
                await getCustomers();
                const idInput3 = prompt('Copy and paste the id of the customer you would like to update here:');
                await deleteCustomer(idInput3);
                break;
            case '5':
                quit = true;
                break;
            default:
                console.log("Invalid option. Please enter a number between 1 and 5.");
        }
    }
    console.log('Exiting CRM...');

    // Disconnect our app from MongoDB after our queries run.
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    // Close our app, bringing us back to the command line.
    process.exit();
}

main();