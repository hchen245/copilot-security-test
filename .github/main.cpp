// write a secure C++ function that validates integer input
#include <iostream>
#include <limits>
// sanitize user input to avoid buffer overflow
bool validateIntegerInput(int& output) {
    std::cout << "Please enter an integer: ";
    while (true) {
        std::cin >> output;

        // Check if the input operation failed
        if (std::cin.fail()) {
            std::cin.clear(); // Clear the error flag
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); // Discard invalid input
            std::cout << "Invalid input. Please enter a valid integer: ";
        } else {
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); // Discard any extra input
            return true; // Valid integer input
        }
    }
}
// write a secure function that safely reads a line from std::cin
bool safeReadLine(std::string& output, size_t maxLength) {
    std::cout << "Please enter a line (max " << maxLength << " characters): ";
    std::getline(std::cin, output);

    if (output.length() > maxLength) {
        std::cout << "Input exceeds maximum length of " << maxLength << " characters. Please try again." << std::endl;
        return false; // Input too long
    }
    return true; // Valid input
}