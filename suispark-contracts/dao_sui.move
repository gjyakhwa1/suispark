
module dao_sui::dao_sui {

    use std::string;
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    const SUPER_WALLET:address = @0x3d2e7fbc0bccd8ab4b5e3375cc28cf22a343ed4e96e96f45450c4e019a9fe445;
    const APPROVALS_THRESHOLD:u8 = 2;
    const PROJECT_FUND: u64 = 500_000_000;

    public struct Project has key, store {
        id:UID,
        user:address,
        description:string::String,
        approvals:u8,
        approved:bool

    }

    public struct ProjectCreated has copy, drop {
        project_id:ID,
        creator:address,
       
    }

    public struct ProjectApproved has copy, drop {
        project_id:ID,
        approvals:u8

    }

    // public struct AdminCap has key, store {
    //     id:UID
    // }

    // public fun add_admin(_:&AdminCap, new_admin:address, ctx:&mut TxContext) {
    //     let admin = AdminCap{
    //         id:object::new(ctx)
    //     };
    //     transfer::public_transfer(admin, new_admin);
        
    // }

    // public struct ApproverCap has key {
    //     id:UID
    // }

    //user functions

    //  fun init(ctx:&mut TxContext) {
    //     let admin =  AdminCap{
    //         id:object::new(ctx)
    //     };
    //     transfer::transfer(admin, ctx.sender());
    // }

    public fun submit_project(description:vector<u8>,fee: Coin<SUI>,ctx:&mut TxContext) {

      transfer::public_transfer(fee, SUPER_WALLET);

        let sender = tx_context::sender(ctx);
        let project = Project{
            id:object::new(ctx),
            user:sender,
            description:string::utf8(description),
            approvals:0,
            approved:false
        };

        // Emit event
        let project_id = object::id(&project);
        event::emit(ProjectCreated { project_id:project_id, creator: sender });

        // make project shared object
        transfer::share_object(project);


    }

    public fun approve_project(,votes:u8, project:&mut Project) {

        project.approvals = votes;
        project.approved = project.approvals >= APPROVALS_THRESHOLD;
        event::emit(ProjectApproved{
            project_id:object::id(project),
            approvals:project.approvals
        })
    }

    public fun get_funds(coin: &mut Coin<SUI>, project:&Project,ctx:&mut TxContext) {

        assert!(project.approved, 1);

    
        let split_coin = coin::split(coin, PROJECT_FUND,ctx);
        transfer::public_transfer(split_coin, project.user);
    }



}
