{
    "variables": {
        "version": "",
        "branch": "",
        "aws_region": "",
        "aws_ubuntu_ami": "",
        "stack_type": ""
    },
    "builders": [
        {
            "name": "mmw-app",
            "type": "amazon-ebs",
            "region": "{{user `aws_region`}}",
            "source_ami": "{{user `aws_ubuntu_ami`}}",
            "instance_type": "m3.large",
            "ssh_username": "ubuntu",
            "ami_name": "mmw-app-{{timestamp}}",
            "run_tags": {
                "PackerBuilder": "amazon-ebs"
            },
            "tags": {
                "Name": "mmw-app",
                "Version": "{{user `version`}}",
                "Branch": "{{user `branch`}}",
                "Created": "{{ isotime }}",
                "Service": "Application",
                "Environment": "{{user `stack_type`}}"
            },
            "associate_public_ip_address": true
        }
    ],
    "provisioners": [
        {
            "type": "shell",
            "inline": [
                "sleep 5",
                "sudo apt-get update -qq",
                "sudo apt-get install python-pip python-dev -y",
                "sudo pip install ansible==1.9.0.1"
            ]
        },
        {
            "type": "ansible-local",
            "playbook_file": "ansible/app-servers.yml",
            "playbook_dir": "ansible",
            "inventory_file": "ansible/inventory/packer-app-server",
            "only": [
                "mmw-app"
            ]
        }
    ]
}