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
            return [];
        } else {
            console.log('\nBelow is a list of customers:');
            customers.forEach((customer, index) => {
                console.log(`id: ${customer.id} --  Name: ${customer.name}, Age: ${customer.age}`);
            });
            return customers;
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
};

const updateCustomer = async (id, customerData) => {
    const customer = await validateCustomer(id);
    if (!customer) {
        return;
    }

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
    const customer = await validateCustomer(id);
    if (!customer) {
        return;
    }

    const deletedCustomer = await Customer.findByIdAndDelete(id);
    console.log('Removed todo:', deletedCustomer);
}

const getInput = () => {
    const name = prompt('Enter Name: ');
    const age = parseInt(prompt('Enter Age: '), 10);
    return { name, age };
}

const getCustomerId = async (action) => {
    const customers = await getCustomers();
    if (customers.length === 0) {
        return null;
    }
    const id = prompt(`Copy and paste the ID of the customer you would like to ${action}: `);
    return id;
}

const validateCustomer = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Error: Invalid ID format');
        return null;
    }

    const customer = await Customer.findById(id);
    if (!customer) {
        console.log('Error: No Customer found with that ID.')
        return null;
    }

    return customer;
}

// APP
const main = async () => {
    await connect();

    let quit = false;

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
            case '1': {
                const customerData = getInput();
                await createCustomer(customerData);
                break;
            }
            case '2': {
                await getCustomers();
                break;
            }
            case '3': {
                const id = await getCustomerId('update');
                if (id) {
                    const updatedData = getInput();
                    await updateCustomer(id, updatedData);
                }
                break;
            }
            case '4': {
                const id = await getCustomerId('delete');
                if (id) {
                    await deleteCustomer(id);
                }
                break;
            }
            case '5': {
                quit = true;
                break;
            }
            default: {
                console.log("Invalid option. Please enter a number between 1 and 5.");
            }
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